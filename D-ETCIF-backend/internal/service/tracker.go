// Package service
// D-ETCIF-backend/internal/service/tracker.go
package service

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"math"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

const (
	minDurationMS    = 300
	maxDurationMS    = 2 * 60 * 60 * 1000
	jitterWindowMS   = 200
	dedupeWindowMS   = 3000
	maxContentLength = 100 * 1024
)

var (
	eventLastSeen sync.Map // key: dedupe key, value: time.Time
	dropCounters  sync.Map // key: reason, value: *uint64
)

type TrackerService struct{}

type TrackerDropError struct {
	Reason string
}

func (e *TrackerDropError) Error() string {
	if e == nil {
		return "tracker dropped"
	}
	if strings.TrimSpace(e.Reason) == "" {
		return "tracker dropped"
	}
	return "tracker dropped: " + e.Reason
}

func NewTrackerService() *TrackerService {
	return &TrackerService{}
}

func hashText(v string) string {
	h := sha1.Sum([]byte(v))
	return hex.EncodeToString(h[:])
}

func shouldDropByWindow(key string, windowMS int) bool {
	now := time.Now()
	if lastRaw, ok := eventLastSeen.Load(key); ok {
		last := lastRaw.(time.Time)
		if now.Sub(last) < time.Duration(windowMS)*time.Millisecond {
			return true
		}
	}
	eventLastSeen.Store(key, now)
	return false
}

func recordDrop(reason string) {
	counterRaw, _ := dropCounters.LoadOrStore(reason, new(uint64))
	counter := counterRaw.(*uint64)
	total := atomic.AddUint64(counter, 1)
	if total == 1 || total%100 == 0 {
		utils.Infof("Tracker 丢弃规则命中: reason=%s total=%d", reason, total)
	}
}

func hasBlankCode(content string) bool {
	trimmed := strings.TrimSpace(content)
	if trimmed == "" {
		return true
	}

	lines := strings.Split(trimmed, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		return false
	}
	return true
}

func validatePreEvent(event *model.PreEvent) error {
	if strings.TrimSpace(event.StudentID) == "" {
		return errors.New("student_id missing")
	}
	if strings.TrimSpace(event.ExperimentID) == "" {
		return errors.New("experiment_id missing")
	}
	if strings.TrimSpace(event.ResourceID) == "" {
		return errors.New("resource_id missing")
	}
	if strings.TrimSpace(event.ResourceName) == "" {
		return errors.New("resource_name missing")
	}
	if !strings.HasPrefix(strings.TrimSpace(event.Path), "/student") {
		return errors.New("path out of whitelist")
	}
	if event.Duration <= 0 {
		return errors.New("duration <= 0")
	}
	if event.Duration < minDurationMS {
		return errors.New("duration too short")
	}
	if event.Duration > maxDurationMS {
		return errors.New("duration too long")
	}

	jitterKey := fmt.Sprintf("pre:jitter:%s:%s:%s", event.StudentID, event.ExperimentID, event.ResourceID)
	if shouldDropByWindow(jitterKey, jitterWindowMS) {
		return errors.New("jitter duplicate")
	}

	dedupeKey := fmt.Sprintf("pre:dedupe:%s:%s:%s:%s", event.StudentID, event.ExperimentID, event.ResourceID, hashText(event.Path))
	if shouldDropByWindow(dedupeKey, dedupeWindowMS) {
		return errors.New("short-window duplicate")
	}

	return nil
}

func validateMidEvent(event *model.MidEvent) error {
	if strings.TrimSpace(event.StudentID) == "" {
		return errors.New("student_id missing")
	}
	if strings.TrimSpace(event.ExperimentID) == "" {
		return errors.New("experiment_id missing")
	}
	if strings.TrimSpace(event.ActionType) == "" {
		return errors.New("action_type missing")
	}
	if event.Duration <= 0 {
		return errors.New("duration <= 0")
	}
	if event.Duration < minDurationMS {
		return errors.New("duration too short")
	}
	if event.Duration > maxDurationMS {
		return errors.New("duration too long")
	}
	if hasBlankCode(event.Content) {
		return errors.New("blank or comment-only content")
	}
	if len(event.Content) > maxContentLength {
		return errors.New("content too long")
	}

	jitterKey := fmt.Sprintf("mid:jitter:%s:%s:%s", event.StudentID, event.ExperimentID, event.ActionType)
	if shouldDropByWindow(jitterKey, jitterWindowMS) {
		return errors.New("jitter duplicate")
	}

	dedupeKey := fmt.Sprintf("mid:dedupe:%s:%s:%s:%s", event.StudentID, event.ExperimentID, event.ActionType, hashText(event.Content))
	if shouldDropByWindow(dedupeKey, dedupeWindowMS) {
		return errors.New("short-window duplicate")
	}

	return nil
}

func validatePostEvent(event *model.PostEvent) error {
	if strings.TrimSpace(event.StudentID) == "" {
		return errors.New("student_id missing")
	}
	if strings.TrimSpace(event.ExperimentID) == "" {
		return errors.New("experiment_id missing")
	}
	if strings.TrimSpace(event.ActionType) == "" {
		return errors.New("action_type missing")
	}
	if strings.TrimSpace(event.Content) == "" {
		return errors.New("content missing")
	}
	if len(event.Content) > maxContentLength {
		return errors.New("content too long")
	}
	if math.IsNaN(float64(event.Score)) || math.IsInf(float64(event.Score), 0) {
		return errors.New("score is NaN/Inf")
	}
	if event.Score < 0 || event.Score > 100 {
		return errors.New("score out of range")
	}

	jitterKey := fmt.Sprintf("post:jitter:%s:%s:%s", event.StudentID, event.ExperimentID, event.ActionType)
	if shouldDropByWindow(jitterKey, jitterWindowMS) {
		return errors.New("jitter duplicate")
	}

	dedupeKey := fmt.Sprintf("post:dedupe:%s:%s:%s:%s", event.StudentID, event.ExperimentID, event.ActionType, hashText(event.Content))
	if shouldDropByWindow(dedupeKey, dedupeWindowMS) {
		return errors.New("short-window duplicate")
	}

	return nil
}

func writeNeo4j(ctx context.Context, cypher string, params map[string]interface{}) error {
	if config.Neo4jDriver == nil {
		return errors.New("neo4j is not initialized")
	}

	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err := session.Run(ctx, cypher, params)
	return err
}

// TrackPre 实验前数据处理
func (s *TrackerService) TrackPre(event *model.PreEvent) error {
	if err := validatePreEvent(event); err != nil {
		recordDrop("pre:" + err.Error())
		return &TrackerDropError{Reason: err.Error()}
	}

	ctx := context.Background()
	event.CreatedAt = time.Now()

	tx := config.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Create(event).Error; err != nil {
		tx.Rollback()
		utils.Errorf("TrackPre MySQL 存储失败: %v", err)
		return err
	}

	cypher := `
		MERGE (s:Student {id: $student_id})
		MERGE (r:Resource {id: $resource_id, name: $resource_name})
		MERGE (s)-[rel:PREVIEW {experiment_id: $experiment_id}]->(r)
		ON CREATE SET rel.count = 1, rel.total_duration = $duration, rel.last_accessed = $now
		ON MATCH SET rel.count = rel.count + 1, rel.total_duration = rel.total_duration + $duration, rel.last_accessed = $now
	`
	params := map[string]interface{}{
		"student_id":    event.StudentID,
		"resource_id":   event.ResourceID,
		"resource_name": event.ResourceName,
		"experiment_id": event.ExperimentID,
		"duration":      event.Duration,
		"now":           time.Now().Format(time.RFC3339),
	}

	if err := writeNeo4j(ctx, cypher, params); err != nil {
		tx.Rollback()
		utils.Errorf("TrackPre Neo4j 存储失败: %v", err)
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	PublishBehaviorEvent(&model.BehaviorEvent{
		Kind:         model.BehaviorKindPreEvent,
		Stage:        "pre",
		Source:       "tracker",
		StudentID:    event.StudentID,
		ExperimentID: event.ExperimentID,
		ActionType:   "resource_click",
		OccurredAt:   event.CreatedAt,
		Payload: map[string]interface{}{
			"event_id":      event.ID,
			"resource_id":   event.ResourceID,
			"resource_name": event.ResourceName,
			"path":          event.Path,
			"duration":      event.Duration,
			"created_at":    event.CreatedAt,
		},
	})

	return nil
}

// TrackMid 实验中数据处理
func (s *TrackerService) TrackMid(event *model.MidEvent) error {
	if err := validateMidEvent(event); err != nil {
		recordDrop("mid:" + err.Error())
		return &TrackerDropError{Reason: err.Error()}
	}

	ctx := context.Background()
	event.CreatedAt = time.Now()

	tx := config.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Create(event).Error; err != nil {
		tx.Rollback()
		utils.Errorf("TrackMid MySQL 存储失败: %v", err)
		return err
	}

	cypher := `
		MERGE (s:Student {id: $student_id})
		MERGE (a:Action {type: $action_type, experiment_id: $experiment_id})
		CREATE (s)-[rel:PERFORM {content: $content, duration: $duration, timestamp: $now}]->(a)
	`
	params := map[string]interface{}{
		"student_id":    event.StudentID,
		"action_type":   event.ActionType,
		"experiment_id": event.ExperimentID,
		"content":       event.Content,
		"duration":      event.Duration,
		"now":           time.Now().Format(time.RFC3339),
	}

	if err := writeNeo4j(ctx, cypher, params); err != nil {
		tx.Rollback()
		utils.Errorf("TrackMid Neo4j 存储失败: %v", err)
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	PublishBehaviorEvent(&model.BehaviorEvent{
		Kind:         model.BehaviorKindMidEvent,
		Stage:        "mid",
		Source:       "tracker",
		StudentID:    event.StudentID,
		ExperimentID: event.ExperimentID,
		ActionType:   event.ActionType,
		OccurredAt:   event.CreatedAt,
		Payload: map[string]interface{}{
			"event_id":   event.ID,
			"content":    event.Content,
			"duration":   event.Duration,
			"created_at": event.CreatedAt,
		},
	})

	return nil
}

// TrackPost 实验后数据处理
func (s *TrackerService) TrackPost(event *model.PostEvent) error {
	if err := validatePostEvent(event); err != nil {
		recordDrop("post:" + err.Error())
		return &TrackerDropError{Reason: err.Error()}
	}

	ctx := context.Background()
	event.CreatedAt = time.Now()

	tx := config.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Create(event).Error; err != nil {
		tx.Rollback()
		utils.Errorf("TrackPost MySQL 存储失败: %v", err)
		return err
	}

	cypher := `
		MERGE (s:Student {id: $student_id})
		MERGE (e:Experiment {id: $experiment_id})
		CREATE (s)-[rel:COMPLETE {action_type: $action_type, score: $score, content: $content, timestamp: $now}]->(e)
	`
	params := map[string]interface{}{
		"student_id":    event.StudentID,
		"experiment_id": event.ExperimentID,
		"action_type":   event.ActionType,
		"score":         event.Score,
		"content":       event.Content,
		"now":           time.Now().Format(time.RFC3339),
	}

	if err := writeNeo4j(ctx, cypher, params); err != nil {
		tx.Rollback()
		utils.Errorf("TrackPost Neo4j 存储失败: %v", err)
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	PublishBehaviorEvent(&model.BehaviorEvent{
		Kind:         model.BehaviorKindPostEvent,
		Stage:        "post",
		Source:       "tracker",
		StudentID:    event.StudentID,
		ExperimentID: event.ExperimentID,
		ActionType:   event.ActionType,
		OccurredAt:   event.CreatedAt,
		Payload: map[string]interface{}{
			"event_id":   event.ID,
			"score":      event.Score,
			"content":    event.Content,
			"created_at": event.CreatedAt,
		},
	})

	return nil
}
