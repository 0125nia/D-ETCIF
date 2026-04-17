// Package service
// D-ETCIF-backend/internal/service/dashboard.go
package service

import (
	"context"
	"fmt"
	"math"

	"D-ETCIF-backend/internal/model"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"gorm.io/gorm"
)

type DashboardService struct {
	db          *gorm.DB
	neo4jDriver neo4j.DriverWithContext
}

var dashboardMasteryRelTypes = []string{"MASTERED", "掌握", "CONFIDENCE", "置信", "WEIGHT", "权重"}

func NewDashboardService(db *gorm.DB, neo4jDriver neo4j.DriverWithContext) *DashboardService {
	return &DashboardService{
		db:          db,
		neo4jDriver: neo4jDriver,
	}
}

func clampPercent(v float64) float64 {
	if v < 0 {
		return 0
	}
	if v > 100 {
		return 100
	}
	return v
}

func normalizeToPercent(raw float64) float64 {
	if raw <= 1 {
		return clampPercent(raw * 100)
	}
	return clampPercent(raw)
}

// GetHeatmapData 获取班级知识点掌握情况 (Neo4j)
func (s *DashboardService) GetHeatmapData(ctx context.Context) ([]model.HeatmapItem, error) {
	if s.neo4jDriver == nil {
		return []model.HeatmapItem{}, nil
	}

	session := s.neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	// 查询所有知识点及其关联学生的平均掌握度（兼容 score/weight/confidence）
	query := `
    MATCH (kp)
    WHERE (kp:KnowledgePoint OR kp:知识点)
    OPTIONAL MATCH (:Student)-[m]->(kp)
    WHERE type(m) IN $relTypes
    WITH kp, avg(coalesce(m.weight, m.confidence, m.score, 0.0)) AS avgMastery
    RETURN
      toString(coalesce(kp.id, kp.kp_id, kp.name, kp.kp_name)),
      toString(coalesce(kp.name, kp.kp_name, kp.id, kp.kp_id)),
      toString(coalesce(kp.group, kp.chapter, '基础')),
      coalesce(avgMastery, 0.0)
    ORDER BY 2 ASC
    `
	result, err := session.Run(ctx, query, map[string]interface{}{
		"relTypes": dashboardMasteryRelTypes,
	})
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
			Value: math.Round(normalizeToPercent(avgScore)*10) / 10,
		})
	}
	if err := result.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

// GetBehaviorData 获取班级整体行为分析 (MySQL)
func (s *DashboardService) GetBehaviorData() (*model.BehaviorData, error) {
	dimensions := []string{"参与度", "工具使用", "代码规范", "逻辑理解", "理论基础"}
	values := make([]float64, 0, len(dimensions))
	if s.db == nil {
		return &model.BehaviorData{Dimensions: dimensions, Values: []float64{0, 0, 0, 0, 0}}, nil
	}

	var studentCount int64
	_ = s.db.Model(&model.User{}).Where("role = ?", 1).Count(&studentCount).Error
	if studentCount <= 0 {
		studentCount = 1
	}

	var totalMid, errorMid, stepMid int64
	_ = s.db.Model(&model.MidEvent{}).Count(&totalMid).Error
	_ = s.db.Model(&model.MidEvent{}).Where("action_type = ?", "error").Count(&errorMid).Error
	_ = s.db.Model(&model.MidEvent{}).Where("action_type <> ?", "error").Count(&stepMid).Error

	var avgOperation float64
	_ = s.db.Model(&model.OperationResult{}).Select("COALESCE(AVG(operation_score), 0)").Row().Scan(&avgOperation)

	var avgPostQuiz float64
	_ = s.db.Model(&model.PostEvent{}).
		Where("action_type IN ?", []string{"post_quiz_submit", "finish_experiment"}).
		Select("COALESCE(AVG(score), 0)").
		Row().
		Scan(&avgPostQuiz)

	engagement := clampPercent((float64(totalMid) / float64(studentCount)) * 4) // 人均25次约100分
	toolUsage := normalizeToPercent(avgOperation)
	codeNorm := 0.0
	logic := 0.0
	if totalMid > 0 {
		errorRate := float64(errorMid) * 100 / float64(totalMid)
		codeNorm = clampPercent(100 - errorRate)
		logic = clampPercent(float64(stepMid) * 100 / float64(totalMid))
	}
	theory := normalizeToPercent(avgPostQuiz)

	values = append(values,
		math.Round(engagement*10)/10,
		math.Round(toolUsage*10)/10,
		math.Round(codeNorm*10)/10,
		math.Round(logic*10)/10,
		math.Round(theory*10)/10,
	)

	return &model.BehaviorData{Dimensions: dimensions, Values: values}, nil
}

// GetWarningData 获取预警数据 (MySQL + Neo4j)
func (s *DashboardService) GetWarningData(ctx context.Context) (*model.WarningData, error) {
	var warningData model.WarningData
	if s.db == nil {
		warningData.LowConfidence = []model.LowConfidenceStudent{}
		warningData.HighFrequencyError = []model.HighFreqError{}
		return &warningData, nil
	}

	// 1. 统计高频错误知识点 (MySQL)
	// 逻辑：计算每个知识点的错误次数占总报错次数的百分比
	err := s.db.Raw(`
        SELECT 
            COALESCE(NULLIF(TRIM(kp_name), ''), '未标注知识点') as title, 
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

	// 2. 低置信度学生（Neo4j 优先）
	warningData.LowConfidence = []model.LowConfidenceStudent{}
	if s.neo4jDriver != nil {
		session := s.neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
		defer session.Close(ctx)

		query := `
		MATCH (s:Student)-[m]->(kp)
		WHERE (kp:KnowledgePoint OR kp:知识点) AND type(m) IN $relTypes
		WITH s, kp, coalesce(m.weight, m.confidence, m.score, 0.0) AS mastery
		WITH s, kp, CASE
			WHEN mastery > 1 THEN mastery / 100.0
			WHEN mastery < 0 THEN 0.0
			ELSE mastery
		END AS norm_mastery
		WITH s,
			 collect({kp: toString(coalesce(kp.name, kp.kp_name, kp.id, kp.kp_id)), mastery: norm_mastery}) AS items,
			 avg(norm_mastery) AS avg_mastery
		WITH s, avg_mastery,
			 reduce(minItem = {kp: '未知知识点', mastery: 2.0}, item IN items |
				CASE WHEN item.mastery < minItem.mastery THEN item ELSE minItem END) AS weakest
		RETURN toString(coalesce(s.name, s.student_name, s.id)) AS student_name,
			   weakest.kp AS weakest_kp,
			   avg_mastery
		ORDER BY avg_mastery ASC
		LIMIT 5
		`
		result, neoErr := session.Run(ctx, query, map[string]interface{}{
			"relTypes": dashboardMasteryRelTypes,
		})
		if neoErr == nil {
			for result.Next(ctx) {
				record := result.Record()
				score := 0.0
				if v, ok := record.Values[2].(float64); ok {
					score = v
				}
				warningData.LowConfidence = append(warningData.LowConfidence, model.LowConfidenceStudent{
					Name:    fmt.Sprint(record.Values[0]),
					Subject: fmt.Sprint(record.Values[1]),
					Score:   math.Round(clampPercent(score*100)) / 100,
				})
			}
		}
	}

	// Neo4j 不可用或无数据时，回退到 MySQL 低操作分学生
	if len(warningData.LowConfidence) == 0 {
		_ = s.db.Raw(`
			SELECT
				COALESCE(u.name, CONCAT('学生', o.user_id)) AS name,
				CONCAT('实验 ', o.experiment_id) AS subject,
				ROUND(COALESCE(o.operation_score, 0) / 100.0, 2) AS score
			FROM operation_results o
			LEFT JOIN users u ON u.id = o.user_id
			ORDER BY o.operation_score ASC
			LIMIT 5
		`).Scan(&warningData.LowConfidence).Error
	}

	return &warningData, nil
}
