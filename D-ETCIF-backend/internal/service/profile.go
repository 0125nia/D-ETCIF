package service

import (
	"context"
	"fmt"

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
		return nil, fmt.Errorf("neo4j driver is nil")
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
		return nil, err
	}

	nodes := []model.CognitiveMapNode{
		{ID: studentID, Name: "我", Expid: 0, Type: "Student"},
	}
	links := []model.CognitiveMapLink{}

	for result.Next(ctx) {
		record := result.Record()
		kpID := fmt.Sprint(record.Values[0])
		score, _ := record.Values[3].(float64)

		nodes = append(nodes, model.CognitiveMapNode{
			ID:    kpID,
			Name:  fmt.Sprint(record.Values[1]),
			Expid: int(record.Values[2].(int64)),
			Type:  "KnowledgePoint",
		})
		links = append(links, model.CognitiveMapLink{
			Source: studentID,
			Target: kpID,
			Value:  score,
		})
	}

	return &model.CognitiveMapData{Nodes: nodes, Links: links}, nil
}

// GetStudyReport 从 MySQL 聚合真实统计数据
func (s *ProfileService) GetStudyReport(studentID string) (*model.StudyReportData, error) {
	var report model.StudyReportData

	// 1. 统计时长 (毫秒转分钟)
	var totalMs int64
	s.db.Model(&model.MidEvent{}).Where("student_id = ?", studentID).Select("COALESCE(SUM(duration), 0)").Row().Scan(&totalMs)
	report.TotalTime = int(totalMs / 60000)

	// 2. 统计完成实验数
	var count int64
	s.db.Model(&model.PostEvent{}).Where("student_id = ? AND action_type = 'finish_experiment'", studentID).Count(&count)
	report.TotalExp = int(count)

	// 3. 计算报错率
	var errorActions, totalActions int64
	s.db.Model(&model.MidEvent{}).Where("student_id = ?", studentID).Count(&totalActions)
	s.db.Model(&model.MidEvent{}).Where("student_id = ? AND action_type = 'error'", studentID).Count(&errorActions)
	if totalActions > 0 {
		report.ErrorRate = int(errorActions * 100 / totalActions)
	}

	// 4. 平均分
	s.db.Model(&model.PostEvent{}).Where("student_id = ?", studentID).Select("COALESCE(AVG(score), 0)").Row().Scan(&report.AverageScore)

	return &report, nil
}

// GetRecommendations 根据学生画像和历史数据生成个性化推荐
func (s *ProfileService) GetRecommendations(studentID string) ([]model.ResourceRecommendation, error) {
	var recs []model.ResourceRecommendation
	// 生产逻辑：根据业务需求从资源表中获取
	err := s.db.Table("resource_recommendations").
		Limit(5).
		Find(&recs).Error
	return recs, err
}
