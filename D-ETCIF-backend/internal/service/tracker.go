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
	"strconv"
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

	weightDurationCapMS = 5 * 60 * 1000 // 5 min

	preBaseDelta     = 0.010
	preDurationCoeff = 0.030

	midBaseDelta        = 0.015
	midDurationCoeff    = 0.035
	midCorrectBonus     = 0.020
	midIncorrectPenalty = -0.015

	postBaseDelta        = 0.010
	postDurationCoeff    = 0.020
	postCorrectBonus     = 0.050
	postIncorrectPenalty = -0.030
)

var (
	eventLastSeen sync.Map // key: dedupe key, value: time.Time
	dropCounters  sync.Map // key: reason, value: *uint64
)

type TrackerService struct{}

type TrackerDropError struct {
	Reason string
}

type postQuestionSignal struct {
	QuestionID string
	IsCorrect  bool
	DurationMS int
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

func clamp(value, minV, maxV float64) float64 {
	if value < minV {
		return minV
	}
	if value > maxV {
		return maxV
	}
	return value
}

func normalizeDuration(durationMS int) float64 {
	if durationMS <= 0 {
		return 0
	}
	return clamp(float64(durationMS)/float64(weightDurationCapMS), 0, 1)
}

func computeWeightDelta(stage string, durationMS int, isCorrect *bool) float64 {
	durNorm := normalizeDuration(durationMS)
	switch strings.ToLower(strings.TrimSpace(stage)) {
	case "pre":
		return preBaseDelta + preDurationCoeff*durNorm
	case "mid":
		correctness := 0.0
		if isCorrect != nil {
			if *isCorrect {
				correctness = midCorrectBonus
			} else {
				correctness = midIncorrectPenalty
			}
		}
		return midBaseDelta + midDurationCoeff*durNorm + correctness
	case "post":
		correctness := postIncorrectPenalty
		if isCorrect != nil && *isCorrect {
			correctness = postCorrectBonus
		}
		return postBaseDelta + postDurationCoeff*durNorm + correctness
	default:
		return 0
	}
}

func parseEventContent(content string) map[string]string {
	out := map[string]string{}
	parts := strings.FieldsFunc(content, func(r rune) bool {
		return r == ';' || r == '&' || r == '\n' || r == '\r'
	})
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		kv := strings.SplitN(part, "=", 2)
		if len(kv) != 2 {
			continue
		}
		key := strings.ToLower(strings.TrimSpace(kv[0]))
		val := strings.TrimSpace(kv[1])
		if key != "" {
			out[key] = val
		}
	}
	return out
}

func parseBoolFromMap(m map[string]string, keys ...string) (bool, bool) {
	for _, key := range keys {
		raw, ok := m[strings.ToLower(strings.TrimSpace(key))]
		if !ok {
			continue
		}
		v := strings.ToLower(strings.TrimSpace(raw))
		switch v {
		case "1", "true", "yes", "y":
			return true, true
		case "0", "false", "no", "n":
			return false, true
		}
	}
	return false, false
}

func parseIntFromMap(m map[string]string, keys ...string) (int, bool) {
	for _, key := range keys {
		raw, ok := m[strings.ToLower(strings.TrimSpace(key))]
		if !ok {
			continue
		}
		v, err := strconv.Atoi(strings.TrimSpace(raw))
		if err == nil {
			return v, true
		}
	}
	return 0, false
}

func parseStringFromMap(m map[string]string, keys ...string) (string, bool) {
	for _, key := range keys {
		raw, ok := m[strings.ToLower(strings.TrimSpace(key))]
		if !ok {
			continue
		}
		raw = strings.TrimSpace(raw)
		if raw != "" {
			return raw, true
		}
	}
	return "", false
}

func extractPostQuestionSignal(event *model.PostEvent) (*postQuestionSignal, bool) {
	if event == nil {
		return nil, false
	}
	parsed := parseEventContent(event.Content)
	questionID, ok := parseStringFromMap(parsed, "question_id", "qid", "questionid")
	if !ok {
		return nil, false
	}
	isCorrect, ok := parseBoolFromMap(parsed, "is_correct", "correct", "success")
	if !ok {
		return nil, false
	}
	durationMS, ok := parseIntFromMap(parsed, "duration_ms", "duration")
	if !ok || durationMS <= 0 {
		durationMS = minDurationMS
	}
	return &postQuestionSignal{
		QuestionID: questionID,
		IsCorrect:  isCorrect,
		DurationMS: durationMS,
	}, true
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

func upsertKnowledgeWeightByCypher(ctx context.Context, cypher string, params map[string]interface{}) error {
	if config.Neo4jDriver == nil {
		return errors.New("neo4j is not initialized")
	}
	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)
	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
		_, runErr := tx.Run(ctx, cypher, params)
		return nil, runErr
	})
	return err
}

func updatePreKnowledgeWeight(ctx context.Context, event *model.PreEvent) error {
	delta := computeWeightDelta("pre", event.Duration, nil)
	now := time.Now().Format(time.RFC3339)
	cypher := `
		MERGE (s:Student {id: $student_id})
		MATCH (r)
		WHERE toString(coalesce(r.res_id, r.id, r.resource_id)) = $resource_id
		   OR toString(coalesce(r.name, r.resource_name, r.source_name)) = $resource_name
		MATCH (r)-[]-(kp)
		WHERE (kp:KnowledgePoint OR kp:知识点)
		WITH DISTINCT s, kp
		OPTIONAL MATCH (s)-[rel:WEIGHT {experiment_id: $experiment_id}]->(kp)
		WITH s, kp, coalesce(rel.weight, rel.confidence, 0.0) AS current
		WITH s, kp, CASE
			WHEN current + $delta < 0.0 THEN 0.0
			WHEN current + $delta > 1.0 THEN 1.0
			ELSE current + $delta
		END AS next_weight
		MERGE (s)-[rel:WEIGHT {experiment_id: $experiment_id}]->(kp)
		SET rel.weight = next_weight,
		    rel.confidence = next_weight,
		    rel.last_updated = $now,
		    rel.last_action_type = 'pre_preview',
		    rel.last_duration_ms = $duration_ms
	`
	return upsertKnowledgeWeightByCypher(ctx, cypher, map[string]interface{}{
		"student_id":    event.StudentID,
		"experiment_id": event.ExperimentID,
		"resource_id":   event.ResourceID,
		"resource_name": event.ResourceName,
		"duration_ms":   event.Duration,
		"delta":         delta,
		"now":           now,
	})
}

func updateMidKnowledgeWeight(ctx context.Context, event *model.MidEvent) error {
	var correctnessPtr *bool
	parsed := parseEventContent(event.Content)
	if parsedCorrectness, ok := parseBoolFromMap(parsed, "success", "is_correct", "correct"); ok {
		correctnessPtr = &parsedCorrectness
	}
	delta := computeWeightDelta("mid", event.Duration, correctnessPtr)
	now := time.Now().Format(time.RFC3339)
	cypher := `
		MERGE (s:Student {id: $student_id})
		MATCH (kp)
		WHERE (kp:KnowledgePoint OR kp:知识点)
		  AND toString(coalesce(kp.kp_name, kp.name, kp.id, kp.kp_id)) = $kp_name
		WITH DISTINCT s, kp
		OPTIONAL MATCH (s)-[rel:WEIGHT {experiment_id: $experiment_id}]->(kp)
		WITH s, kp, coalesce(rel.weight, rel.confidence, 0.0) AS current
		WITH s, kp, CASE
			WHEN current + $delta < 0.0 THEN 0.0
			WHEN current + $delta > 1.0 THEN 1.0
			ELSE current + $delta
		END AS next_weight
		MERGE (s)-[rel:WEIGHT {experiment_id: $experiment_id}]->(kp)
		SET rel.weight = next_weight,
		    rel.confidence = next_weight,
		    rel.last_updated = $now,
		    rel.last_action_type = $action_type,
		    rel.last_duration_ms = $duration_ms
	`
	return upsertKnowledgeWeightByCypher(ctx, cypher, map[string]interface{}{
		"student_id":    event.StudentID,
		"experiment_id": event.ExperimentID,
		"kp_name":       strings.TrimSpace(event.KpName),
		"action_type":   event.ActionType,
		"duration_ms":   event.Duration,
		"delta":         delta,
		"now":           now,
	})
}

func updatePostKnowledgeWeightByQuestion(ctx context.Context, event *model.PostEvent, signal *postQuestionSignal) error {
	correctness := signal.IsCorrect
	delta := computeWeightDelta("post", signal.DurationMS, &correctness)
	now := time.Now().Format(time.RFC3339)
	cypher := `
		MERGE (s:Student {id: $student_id})
		MATCH (q)
		WHERE toString(coalesce(q.q_id, q.id, q.question_id, q.qid)) = $question_id
		MATCH (q)-[]-(kp)
		WHERE (kp:KnowledgePoint OR kp:知识点)
		WITH DISTINCT s, kp
		OPTIONAL MATCH (s)-[rel:WEIGHT {experiment_id: $experiment_id}]->(kp)
		WITH s, kp, coalesce(rel.weight, rel.confidence, 0.0) AS current
		WITH s, kp, CASE
			WHEN current + $delta < 0.0 THEN 0.0
			WHEN current + $delta > 1.0 THEN 1.0
			ELSE current + $delta
		END AS next_weight
		MERGE (s)-[rel:WEIGHT {experiment_id: $experiment_id}]->(kp)
		SET rel.weight = next_weight,
		    rel.confidence = next_weight,
		    rel.last_updated = $now,
		    rel.last_action_type = $action_type,
		    rel.last_question_id = $question_id,
		    rel.last_is_correct = $is_correct,
		    rel.last_duration_ms = $duration_ms
	`
	return upsertKnowledgeWeightByCypher(ctx, cypher, map[string]interface{}{
		"student_id":    event.StudentID,
		"experiment_id": event.ExperimentID,
		"question_id":   signal.QuestionID,
		"is_correct":    signal.IsCorrect,
		"duration_ms":   signal.DurationMS,
		"action_type":   event.ActionType,
		"delta":         delta,
		"now":           now,
	})
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
	if err := updatePreKnowledgeWeight(ctx, event); err != nil {
		tx.Rollback()
		utils.Errorf("TrackPre Neo4j 权重更新失败: %v", err)
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
	if strings.TrimSpace(event.KpName) != "" {
		if err := updateMidKnowledgeWeight(ctx, event); err != nil {
			tx.Rollback()
			utils.Errorf("TrackMid Neo4j 权重更新失败: %v", err)
			return err
		}
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
	if signal, ok := extractPostQuestionSignal(event); ok {
		if err := updatePostKnowledgeWeightByQuestion(ctx, event, signal); err != nil {
			tx.Rollback()
			utils.Errorf("TrackPost Neo4j 权重更新失败: %v", err)
			return err
		}
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
