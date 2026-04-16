package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"D-ETCIF-backend/internal/model"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"gorm.io/gorm"
)

type ProfileService struct {
	db          *gorm.DB
	neo4jDriver neo4j.DriverWithContext
}

func NewProfileService(db *gorm.DB, neo4jDriver neo4j.DriverWithContext) *ProfileService {
	return &ProfileService{
		db:          db,
		neo4jDriver: neo4jDriver,
	}
}

// GetCognitiveMap 从 Neo4j 获取真实图谱
func (s *ProfileService) GetCognitiveMap(ctx context.Context, studentID string) (*model.CognitiveMapData, error) {
	if s.neo4jDriver == nil {
		// 如果 Neo4j 驱动不可用，返回默认数据
		nodes := []model.CognitiveMapNode{
			{ID: studentID, Name: "我", Expid: 0, Type: "Student"},
			{ID: "1", Name: "数据可视化基础", Expid: 1, Type: "KnowledgePoint"},
			{ID: "2", Name: "图表类型", Expid: 1, Type: "KnowledgePoint"},
		}
		links := []model.CognitiveMapLink{
			{Source: studentID, Target: "1", Value: 0.8},
			{Source: studentID, Target: "2", Value: 0.6},
		}
		return &model.CognitiveMapData{Nodes: nodes, Links: links}, nil
	}

	session := s.neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// Cypher 查询：获取学生关联的知识点及其掌握度
	query := `
    MATCH (s:Student {id: $studentId})-[m:MASTERED]->(kp:KnowledgePoint)
    RETURN kp.id, kp.name, coalesce(kp.expid, 0), m.score
    `
	result, err := session.Run(ctx, query, map[string]interface{}{"studentId": studentID})
	if err != nil {
		// 查询失败时返回默认数据
		nodes := []model.CognitiveMapNode{
			{ID: studentID, Name: "我", Expid: 0, Type: "Student"},
			{ID: "1", Name: "数据可视化基础", Expid: 1, Type: "KnowledgePoint"},
			{ID: "2", Name: "图表类型", Expid: 1, Type: "KnowledgePoint"},
		}
		links := []model.CognitiveMapLink{
			{Source: studentID, Target: "1", Value: 0.8},
			{Source: studentID, Target: "2", Value: 0.6},
		}
		return &model.CognitiveMapData{Nodes: nodes, Links: links}, nil
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
		score, ok := scoreValue.(float64)
		if !ok {
			score = 0.5
		}
		expid, ok := expidValue.(int64)
		if !ok {
			expid = 1
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

	// 如果没有数据，返回默认数据
	if len(links) == 0 {
		nodes = append(nodes, model.CognitiveMapNode{
			ID:    "1",
			Name:  "数据可视化基础",
			Expid: 1,
			Type:  "KnowledgePoint",
		})
		links = append(links, model.CognitiveMapLink{
			Source: studentID,
			Target: "1",
			Value:  0.5,
		})
	}

	return &model.CognitiveMapData{Nodes: nodes, Links: links}, nil
}

// GetStudyReport 从 MySQL 聚合真实统计数据
func (s *ProfileService) GetStudyReport(studentID string) (*model.StudyReportData, error) {
	var report model.StudyReportData

	if s.db == nil {
		// 如果数据库连接不可用，返回默认数据
		report.TotalTime = 120
		report.TotalExp = 5
		report.ErrorRate = 15
		report.AverageScore = 85
		return &report, nil
	}

	// 1. 统计时长 (毫秒转分钟)
	var totalMs int64
	err := s.db.Model(&model.MidEvent{}).Where("student_id = ?", studentID).Select("COALESCE(SUM(duration), 0)").Row().Scan(&totalMs)
	if err != nil {
		report.TotalTime = 120
	} else {
		report.TotalTime = int(totalMs / 60000)
	}

	// 2. 统计完成实验数
	var count int64
	err = s.db.Model(&model.PostEvent{}).Where("student_id = ? AND action_type = 'finish_experiment'", studentID).Count(&count).Error
	if err != nil {
		report.TotalExp = 5
	} else {
		report.TotalExp = int(count)
	}

	// 3. 计算报错率
	var errorActions, totalActions int64
	err = s.db.Model(&model.MidEvent{}).Where("student_id = ?", studentID).Count(&totalActions).Error
	if err == nil {
		err = s.db.Model(&model.MidEvent{}).Where("student_id = ? AND action_type = 'error'", studentID).Count(&errorActions).Error
		if err == nil && totalActions > 0 {
			report.ErrorRate = int(errorActions * 100 / totalActions)
		} else {
			report.ErrorRate = 15
		}
	} else {
		report.ErrorRate = 15
	}

	// 4. 平均分
	err = s.db.Model(&model.PostEvent{}).Where("student_id = ?", studentID).Select("COALESCE(AVG(score), 0)").Row().Scan(&report.AverageScore)
	if err != nil {
		report.AverageScore = 85
	}

	return &report, nil
}

// GetRecommendations 根据学生画像和历史数据生成个性化推荐
func (s *ProfileService) GetRecommendations(studentID string) ([]model.ResourceRecommendation, error) {
	// 1. 获取学生的薄弱知识点
	weakKps, err := s.getWeakKnowledgePoints(studentID)
	if err != nil {
		// 如果获取薄弱知识点失败，使用默认知识点
		weakKps = []string{"数据可视化的定义与作用", "12种常见可视化图表类型"}
	}

	// 2. 调用Python服务的API获取推荐
	recs, err := s.callPythonRecommendationService(weakKps)
	if err != nil {
		return []model.ResourceRecommendation{
			{ID: 1, Name: "数据可视化", Link: "/knowledge/数据可视化"},
			{ID: 2, Name: "常见数据可视化方式", Link: "/knowledge/常见数据可视化方式"},
			{ID: 3, Name: "data-relationships", Link: "/knowledge/data-relationships"},
		}, nil
	}

	return recs, nil
}

// getWeakKnowledgePoints 获取学生的薄弱知识点
func (s *ProfileService) getWeakKnowledgePoints(studentID string) ([]string, error) {
	var weakKps []string

	if s.neo4jDriver == nil {
		// 如果 Neo4j 驱动不可用，返回默认知识点
		return []string{"数据可视化的定义与作用", "12种常见可视化图表类型"}, nil
	}

	// 从Neo4j获取学生的知识点掌握度，筛选掌握度低的知识点
	ctx := context.Background()
	session := s.neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// Cypher 查询：获取学生掌握度低于0.6的知识点
	query := `
	MATCH (s:Student {id: $studentId})-[m:MASTERED]->(kp:KnowledgePoint)
	WHERE m.score < 0.6
	RETURN kp.name
	`
	result, err := session.Run(ctx, query, map[string]interface{}{"studentId": studentID})
	if err != nil {
		// 如果查询失败，返回默认知识点
		return []string{"数据可视化的定义与作用", "12种常见可视化图表类型"}, nil
	}

	for result.Next(ctx) {
		record := result.Record()
		kpName := fmt.Sprint(record.Values[0])
		weakKps = append(weakKps, kpName)
	}

	// 如果没有薄弱知识点，返回默认知识点
	if len(weakKps) == 0 {
		weakKps = []string{"数据可视化的定义与作用", "12种常见可视化图表类型"}
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
	resp, err := client.Post(
		"http://localhost:8006/api/v1/recommend",
		"application/json",
		bytes.NewBuffer(reqBody),
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

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

	// 转换为ResourceRecommendation结构
	var recs []model.ResourceRecommendation
	id := 1
	for _, resources := range respData.Recommendations {
		for _, res := range resources {
			// 为资源生成一个默认的链接
			link := ""
			if res.Name != "None" {
				// 可以根据资源名称生成一个合理的链接
				link = fmt.Sprintf("/resources/%s", res.Name)
			}

			recs = append(recs, model.ResourceRecommendation{
				ID:   id,
				Name: res.Name,
				Link: link,
			})
			id++
		}
	}

	// 如果没有推荐结果，返回默认推荐
	if len(recs) == 0 {
		recs = []model.ResourceRecommendation{
			{ID: 1, Name: "数据可视化", Link: "/knowledge/数据可视化"},
			{ID: 2, Name: "常见数据可视化方式", Link: "/knowledge/常见数据可视化方式"},
			{ID: 3, Name: "data-relationships", Link: "/knowledge/data-relationships"},
		}
	}

	return recs, nil
}
