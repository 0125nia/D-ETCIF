// Package service
// D-ETCIF-backend/internal/service/dashboard.go
package service

import (
	"context"
	"fmt"

	"D-ETCIF-backend/internal/model"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"gorm.io/gorm"
)

type DashboardService struct {
	db          *gorm.DB
	neo4jDriver neo4j.DriverWithContext
}

func NewDashboardService(db *gorm.DB, neo4jDriver neo4j.DriverWithContext) *DashboardService {
	return &DashboardService{
		db:          db,
		neo4jDriver: neo4jDriver,
	}
}

// GetHeatmapData 获取班级知识点掌握情况 (Neo4j)
func (s *DashboardService) GetHeatmapData(ctx context.Context) ([]model.HeatmapItem, error) {
	if s.neo4jDriver == nil {
		return []model.HeatmapItem{}, nil
	}

	session := s.neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// 查询所有知识点及其关联学生的平均掌握度
	query := `
    MATCH (kp:KnowledgePoint)<-[m:MASTERED]-(:Student)
    RETURN kp.id, kp.name, coalesce(kp.group, '基础'), avg(m.score) as avgScore
    `
	result, err := session.Run(ctx, query, nil)
	if err != nil {
		return nil, err
	}

	list := make([]model.HeatmapItem, 0)
	for result.Next(ctx) {
		record := result.Record()
		avgScore, ok := record.Values[3].(float64)
		if !ok {
			avgScore = 0
		}
		list = append(list, model.HeatmapItem{
			ID:    fmt.Sprint(record.Values[0]),
			Name:  fmt.Sprint(record.Values[1]),
			Group: fmt.Sprint(record.Values[2]),
			Value: avgScore,
		})
	}
	if err := result.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

// GetBehaviorData 获取班级整体行为分析 (MySQL)
func (s *DashboardService) GetBehaviorData() (*model.BehaviorData, error) {
	// 5个维度：概念掌握、工具使用、代码规范、逻辑理解、API记忆
	dimensions := []string{"概念掌握", "工具使用", "代码规范", "逻辑理解", "API记忆"}
	var values []float64

	// 这里演示从 MySQL 聚合逻辑，实际根据你的 behavior_analysis 表结构
	for range dimensions {
		var avgScore float64
		s.db.Model(&model.MidEvent{}).Select("COALESCE(AVG(score), 0)").Row().Scan(&avgScore)
		values = append(values, avgScore)
	}

	return &model.BehaviorData{Dimensions: dimensions, Values: values}, nil
}

// GetWarningData 获取预警数据 (MySQL + Neo4j)
func (s *DashboardService) GetWarningData(ctx context.Context) (*model.WarningData, error) {
	var warningData model.WarningData

	// 1. 统计高频错误知识点 (MySQL)
	// 逻辑：计算每个知识点的错误次数占总报错次数的百分比
	err := s.db.Raw(`
        SELECT 
            kp_name as title, 
			COALESCE(
				CAST(
					ROUND(
						COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM mid_events WHERE action_type = 'error'), 0),
						0
					) AS SIGNED
				),
				0
			) as rate
        FROM mid_events 
        WHERE action_type = 'error'
        GROUP BY kp_name 
        ORDER BY rate DESC 
        LIMIT 3
    `).Scan(&warningData.HighFrequencyError).Error
	if err != nil {
		return nil, err
	}

	// 2. 低置信度学生 (这里留出接口，等后续 Neo4j 链路打通)
	// 目前返回空切片，保证前端渲染不报错
	warningData.LowConfidence = []model.LowConfidenceStudent{}

	return &warningData, nil
}
