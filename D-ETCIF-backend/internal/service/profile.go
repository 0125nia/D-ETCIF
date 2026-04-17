// Package service
// D-ETCIF-backend/internal/service/profile.go
package service

import (
	cfg "D-ETCIF-backend/configs"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"D-ETCIF-backend/internal/model"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"gorm.io/gorm"
)

type ProfileService struct {
	db          *gorm.DB
	neo4jDriver neo4j.DriverWithContext
}

var masteryRelTypes = []string{"MASTERED", "掌握", "CONFIDENCE", "置信", "WEIGHT", "权重"}

func NewProfileService(db *gorm.DB, neo4jDriver neo4j.DriverWithContext) *ProfileService {
	return &ProfileService{
		db:          db,
		neo4jDriver: neo4jDriver,
	}
}

func clampRange(value, minV, maxV float64) float64 {
	if value < minV {
		return minV
	}
	if value > maxV {
		return maxV
	}
	return value
}

func normalizeConfidence(raw float64) float64 {
	if raw <= 1 {
		return clampRange(raw, 0, 1)
	}
	if raw <= 100 {
		return clampRange(raw/100.0, 0, 1)
	}
	return 1
}

func round1(v float64) float64 {
	return math.Round(v*10) / 10
}

func asFloat64(v interface{}, fallback float64) float64 {
	switch n := v.(type) {
	case float64:
		return n
	case float32:
		return float64(n)
	case int64:
		return float64(n)
	case int:
		return float64(n)
	case int32:
		return float64(n)
	default:
		return fallback
	}
}

// GetCognitiveMap 从 Neo4j 获取真实图谱
func (s *ProfileService) GetCognitiveMap(ctx context.Context, studentID string) (*model.CognitiveMapData, error) {
	if s.neo4jDriver == nil {
		return nil, errors.New("neo4j driver is not initialized")
	}

	session := s.neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// 查询学生到知识点的掌握/置信/权重关系
	query := `
    MATCH (s:Student {id: $student_id})
    OPTIONAL MATCH (s)-[m]->(kp)
    WHERE (kp:KnowledgePoint OR kp:知识点) AND type(m) IN $relTypes
    WITH kp, max(coalesce(m.weight, m.confidence, m.score, 0.0)) AS mastery
    WHERE kp IS NOT NULL
    RETURN
      toString(coalesce(kp.id, kp.kp_id, kp.name, kp.kp_name)),
      toString(coalesce(kp.name, kp.kp_name, kp.id, kp.kp_id)),
      toInteger(coalesce(kp.expid, kp.experiment_id, 0)),
      mastery
    ORDER BY mastery DESC
    LIMIT 100
    `
	result, err := session.Run(ctx, query, map[string]interface{}{
		"student_id": studentID,
		"relTypes":   masteryRelTypes,
	})
	if err != nil {
		return nil, err
	}

	nodes := []model.CognitiveMapNode{
		{ID: studentID, Name: "我", Expid: 0, Type: "Student"},
	}
	links := []model.CognitiveMapLink{}

	for result.Next(ctx) {
		record := result.Record()
		if len(record.Values) < 4 {
			continue
		}
		kpIDValue := record.Values[0]
		kpNameValue := record.Values[1]
		expidValue := record.Values[2]
		scoreValue := record.Values[3]
		if kpIDValue == nil || kpNameValue == nil || expidValue == nil || scoreValue == nil {
			continue
		}
		kpID := fmt.Sprint(kpIDValue)
		score := normalizeConfidence(asFloat64(scoreValue, 0.5))
		expid, ok := expidValue.(int64)
		if !ok {
			expid = int64(asFloat64(expidValue, 1))
		}

		nodes = append(nodes, model.CognitiveMapNode{
			ID:    kpID,
			Name:  fmt.Sprint(kpNameValue),
			Expid: int(expid),
			Type:  "KnowledgePoint",
		})
		links = append(links, model.CognitiveMapLink{
			Source: studentID,
			Target: kpID,
			Value:  score,
		})
	}

	if err := result.Err(); err != nil {
		return nil, err
	}

	return &model.CognitiveMapData{Nodes: nodes, Links: links}, nil
}

// GetStudyReport 从 MySQL 聚合真实统计数据
func (s *ProfileService) GetStudyReport(studentID string) (*model.StudyReportData, error) {
	var report model.StudyReportData

	if s.db == nil {
		return nil, errors.New("database is not initialized")
	}

	// 1. 统计时长 (pre + mid，毫秒转分钟)
	var totalMs int64
	err := s.db.Raw(`
		SELECT
			COALESCE((SELECT SUM(duration) FROM pre_events WHERE student_id = ?), 0) +
			COALESCE((SELECT SUM(duration) FROM mid_events WHERE student_id = ?), 0)`,
		studentID, studentID,
	).Row().Scan(&totalMs)
	if err != nil {
		return nil, err
	}
	report.TotalTime = int(totalMs / 60000)

	// 2. 统计学习实验数（experiments 表优先）
	userIDInt, parseUserErr := strconv.ParseInt(strings.TrimSpace(studentID), 10, 64)
	if parseUserErr == nil {
		var count int64
		err = s.db.Model(&model.Experiment{}).Where("user_id = ?", userIDInt).Count(&count).Error
		if err == nil {
			report.TotalExp = int(count)
		}
	}
	if report.TotalExp == 0 {
		var count int64
		err = s.db.Raw(`
			SELECT COUNT(*) FROM (
				SELECT experiment_id FROM mid_events WHERE student_id = ?
				UNION
				SELECT experiment_id FROM post_events WHERE student_id = ?
			) t`, studentID, studentID).Row().Scan(&count)
		if err != nil {
			return nil, err
		}
		report.TotalExp = int(count)
	}

	// 3. 计算报错率
	var errorActions, totalActions int64
	err = s.db.Model(&model.MidEvent{}).Where("student_id = ?", studentID).Count(&totalActions).Error
	if err == nil {
		err = s.db.Model(&model.MidEvent{}).Where("student_id = ? AND action_type = 'error'", studentID).Count(&errorActions).Error
		if err == nil && totalActions > 0 {
			report.ErrorRate = round1(float64(errorActions) * 100 / float64(totalActions))
		} else {
			report.ErrorRate = 0
		}
	} else {
		return nil, err
	}

	// 4. 平均分（operation_results 优先，fallback 到 post_events）
	var avgScore float64
	if parseUserErr == nil {
		err = s.db.Model(&model.OperationResult{}).
			Where("user_id = ?", userIDInt).
			Select("COALESCE(AVG(operation_score), 0)").
			Row().
			Scan(&avgScore)
	}
	if err != nil || avgScore <= 0 {
		err = s.db.Model(&model.PostEvent{}).
			Where("student_id = ? AND action_type IN ?", studentID, []string{"post_quiz_submit", "finish_experiment"}).
			Select("COALESCE(AVG(score), 0)").
			Row().
			Scan(&avgScore)
	}
	if err != nil {
		return nil, err
	}
	report.AverageScore = round1(clampRange(avgScore, 0, 100))

	return &report, nil
}

// GetRecommendations 根据学生画像和历史数据生成个性化推荐
func (s *ProfileService) GetRecommendations(studentID string) ([]model.ResourceRecommendation, error) {
	// 1. 获取学生的薄弱知识点
	weakKps, err := s.getWeakKnowledgePoints(studentID)
	if err != nil {
		return nil, err
	}

	// 2. 调用Python服务的API获取推荐
	recs, err := s.callPythonRecommendationService(weakKps)
	if err != nil {
		return nil, err
	}

	if len(recs) > 3 {
		recs = recs[:3]
	}
	return recs, nil
}

// getWeakKnowledgePoints 获取学生的薄弱知识点
func (s *ProfileService) getWeakKnowledgePoints(studentID string) ([]string, error) {
	var weakKps []string

	if s.neo4jDriver == nil {
		return nil, errors.New("neo4j driver is not initialized")
	}

	// 从Neo4j获取学生的知识点掌握度，筛选掌握度低的知识点
	ctx := context.Background()
	session := s.neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// 查询学生掌握/置信/权重低于阈值的知识点
	query := `
	MATCH (s:Student {id: $student_id})-[m]->(kp)
	WHERE (kp:KnowledgePoint OR kp:知识点) AND type(m) IN $relTypes
	WITH kp, coalesce(m.weight, m.confidence, m.score, 0.0) AS mastery
	WITH kp, CASE
		WHEN mastery > 1 THEN mastery / 100.0
		WHEN mastery < 0 THEN 0.0
		ELSE mastery
	END AS norm_mastery
	WHERE norm_mastery < 0.6
	RETURN toString(coalesce(kp.name, kp.kp_name, kp.id, kp.kp_id)) AS kp_name, norm_mastery
	ORDER BY norm_mastery ASC
	LIMIT 5
	`
	result, err := session.Run(ctx, query, map[string]interface{}{
		"student_id": studentID,
		"relTypes":   masteryRelTypes,
	})
	if err != nil {
		return nil, err
	}

	for result.Next(ctx) {
		record := result.Record()
		kpName := fmt.Sprint(record.Values[0])
		weakKps = append(weakKps, kpName)
	}

	if err := result.Err(); err != nil {
		return nil, err
	}

	return weakKps, nil
}

// callPythonRecommendationService 调用Python服务的API获取推荐
func (s *ProfileService) callPythonRecommendationService(weakKps []string) ([]model.ResourceRecommendation, error) {
	// 准备请求数据
	reqData := map[string]interface{}{
		"weak_kps": weakKps,
		"topk":     3,
	}
	reqBody, err := json.Marshal(reqData)
	if err != nil {
		return nil, err
	}

	// 创建HTTP客户端
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// 发送POST请求到Python服务
	if cfg.Config == nil || cfg.Config.Python == nil {
		return nil, errors.New("python service config is not initialized: ensure Python.BaseURL is configured")
	}
	baseURL := strings.TrimRight(cfg.Config.Python.BaseURL, "/")
	if baseURL == "" {
		return nil, errors.New("python recommendation base url is empty")
	}
	resp, err := client.Post(
		baseURL+"/api/v1/recommend",
		"application/json",
		bytes.NewBuffer(reqBody),
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("python recommendation service status=%d", resp.StatusCode)
	}

	// 解析响应
	var respData struct {
		Recommendations map[string][]struct {
			Name  string  `json:"name"`
			Score float64 `json:"score"`
		} `json:"recommendations"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
		return nil, err
	}

	type rec struct {
		name  string
		score float64
	}
	all := make([]rec, 0, 8)
	for _, resources := range respData.Recommendations {
		for _, item := range resources {
			name := strings.TrimSpace(item.Name)
			if name == "" || strings.EqualFold(name, "none") {
				continue
			}
			all = append(all, rec{name: name, score: item.Score})
		}
	}
	sort.SliceStable(all, func(i, j int) bool {
		return all[i].score > all[j].score
	})

	// 转换为ResourceRecommendation结构并去重，保留 topk
	var recs []model.ResourceRecommendation
	seen := map[string]struct{}{}
	for _, item := range all {
		if len(recs) >= 3 {
			break
		}
		if _, ok := seen[item.name]; ok {
			continue
		}
		seen[item.name] = struct{}{}
		recs = append(recs, model.ResourceRecommendation{
			ID:   len(recs) + 1,
			Name: item.name,
			Link: "/resources/" + url.PathEscape(item.name),
		})
	}

	return recs, nil
}
