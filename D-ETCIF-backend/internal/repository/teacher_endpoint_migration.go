// Package repository
// D-ETCIF-backend/internal/repository/teacher_endpoint_migration.go
package repository

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"gorm.io/gorm"
)

var seedKnowledgePoints = []string{
	"数据读取",
	"图表选择",
	"参数配置",
	"结果解读",
	"代码规范",
}

// MigrateTeacherEndpointData 为教师端结果页与仪表盘接口补充初始化数据
func MigrateTeacherEndpointData() error {
	var students []model.User
	if err := config.DB.Where("role = ?", 1).Find(&students).Error; err != nil {
		return fmt.Errorf("查询学生列表失败: %w", err)
	}
	if len(students) == 0 {
		utils.Info("未找到学生数据，跳过教师端初始化数据迁移")
		return nil
	}

	var experiments []model.Experiment
	if err := config.DB.Find(&experiments).Error; err != nil {
		return fmt.Errorf("查询实验阶段数据失败: %w", err)
	}
	if len(experiments) == 0 {
		utils.Info("实验阶段数据为空，跳过教师端初始化数据迁移")
		return nil
	}

	studentNameMap := make(map[int64]string, len(students))
	for _, student := range students {
		studentNameMap[student.ID] = student.Name
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		}
	}()

	seededMidEvents := 0
	for _, exp := range experiments {
		if _, ok := studentNameMap[exp.UserID]; !ok {
			continue
		}

		opScore := calcOperationScore(exp.UserID, exp.ExperimentID, exp.Stage)
		opResult := model.OperationResult{
			UserID:         exp.UserID,
			ExperimentID:   exp.ExperimentID,
			OperationScore: opScore,
		}
		if err := tx.Where("user_id = ? AND experiment_id = ?", exp.UserID, exp.ExperimentID).
			Assign(model.OperationResult{OperationScore: opScore}).
			FirstOrCreate(&opResult).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("写入操作评分失败(user=%d, exp=%d): %w", exp.UserID, exp.ExperimentID, err)
		}

		summaryStatus := "submitted"
		if (exp.UserID+exp.ExperimentID)%4 == 0 {
			summaryStatus = "draft"
		}
		summary := model.ExperimentSummary{
			UserID:          exp.UserID,
			ExperimentID:    exp.ExperimentID,
			LearningContent: fmt.Sprintf("%s 在实验 %d 中完成了可视化流程，能够正确解释关键图表结论。", studentNameMap[exp.UserID], exp.ExperimentID),
			ProblemsSolved:  fmt.Sprintf("解决了坐标轴中文显示、数据清洗和参数选择问题（阶段 %d）。", exp.Stage),
			Status:          summaryStatus,
		}
		if err := tx.Where("user_id = ? AND experiment_id = ?", exp.UserID, exp.ExperimentID).
			Assign(model.ExperimentSummary{
				LearningContent: summary.LearningContent,
				ProblemsSolved:  summary.ProblemsSolved,
				Status:          summary.Status,
			}).
			FirstOrCreate(&summary).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("写入实验总结失败(user=%d, exp=%d): %w", exp.UserID, exp.ExperimentID, err)
		}

		if (exp.UserID+exp.ExperimentID)%5 != 0 {
			report := model.ExperimentReport{
				UserID:       exp.UserID,
				ExperimentID: exp.ExperimentID,
				FileName:     fmt.Sprintf("S%d_E%d_report.pdf", exp.UserID, exp.ExperimentID),
				FilePath:     fmt.Sprintf("./static/uploads/%d_%d_seed_report.pdf", exp.UserID, exp.ExperimentID),
				Status:       1,
			}
			if err := tx.Where("user_id = ? AND experiment_id = ?", exp.UserID, exp.ExperimentID).
				Assign(model.ExperimentReport{
					FileName: report.FileName,
					FilePath: report.FilePath,
					Status:   report.Status,
				}).
				FirstOrCreate(&report).Error; err != nil {
				tx.Rollback()
				return fmt.Errorf("写入实验报告失败(user=%d, exp=%d): %w", exp.UserID, exp.ExperimentID, err)
			}
		}

		createdMid, err := seedMidEvents(tx, exp.UserID, exp.ExperimentID)
		if err != nil {
			tx.Rollback()
			return err
		}
		seededMidEvents += createdMid
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	utils.Infof("教师端初始化数据迁移完成，实验记录=%d，新增/更新 mid_events=%d", len(experiments), seededMidEvents)

	if err := MigrateTeacherDashboardNeo4jData(students, experiments); err != nil {
		return err
	}

	return nil
}

func calcOperationScore(userID, experimentID int64, stage int) float64 {
	base := 62 + int((userID+experimentID)%28)
	stageBonus := stage * 2
	score := base + stageBonus
	if score > 98 {
		score = 98
	}
	return float64(score)
}

func seedMidEvents(tx *gorm.DB, userID, experimentID int64) (int, error) {
	studentID := strconv.FormatInt(userID, 10)
	expID := strconv.FormatInt(experimentID, 10)
	created := 0

	for i, kp := range seedKnowledgePoints {
		score := 55.0 + float64((userID+experimentID+int64(i))%40)
		action := "step_action"
		content := fmt.Sprintf("seed:step:%s", kp)
		if i%2 == int((userID+experimentID)%2) {
			action = "error"
			content = fmt.Sprintf("seed:error:%s", kp)
			score = 35.0 + float64((userID+experimentID+int64(i))%25)
		}

		event := model.MidEvent{
			StudentID:    studentID,
			ExperimentID: expID,
			ActionType:   action,
			KpName:       kp,
			Score:        score,
			Content:      content,
			Duration:     3000 + i*700,
		}

		if err := tx.Where("student_id = ? AND experiment_id = ? AND action_type = ? AND content = ?", studentID, expID, action, content).
			Assign(model.MidEvent{
				KpName:   event.KpName,
				Score:    event.Score,
				Duration: event.Duration,
			}).
			FirstOrCreate(&event).Error; err != nil {
			return created, fmt.Errorf("写入 mid_event 失败(student=%s, exp=%s, kp=%s): %w", studentID, expID, kp, err)
		}
		created++
	}

	return created, nil
}

type neo4jKnowledgePointSeed struct {
	ID    string
	Name  string
	Group string
	Score float64
}

var heatmapKnowledgePointSeeds = []neo4jKnowledgePointSeed{
	{ID: "kp-1", Name: "数据可视化", Group: "第1章 数据可视化与 matplotlib", Score: 0.92},
	{ID: "kp-2", Name: "常见数据可视化方式", Group: "第1章 数据可视化与 matplotlib", Score: 0.84},
	{ID: "kp-3", Name: "数据的四种关系及图表选择", Group: "第1章 数据可视化与 matplotlib", Score: 0.78},
	{ID: "kp-4", Name: "Python 常见数据可视化库", Group: "第1章 数据可视化与 matplotlib", Score: 0.86},
	{ID: "kp-5", Name: "图形对象层次结构", Group: "第1章 数据可视化与 matplotlib", Score: 0.72},
}

func MigrateTeacherDashboardNeo4jData(students []model.User, experiments []model.Experiment) error {
	if config.Neo4jDriver == nil {
		return fmt.Errorf("neo4j driver is not initialized")
	}
	if len(students) == 0 || len(experiments) == 0 {
		utils.Info("学生或实验数据为空，跳过Neo4j heatmap迁移")
		return nil
	}

	studentNameMap := make(map[int64]string, len(students))
	for _, student := range students {
		studentNameMap[student.ID] = student.Name
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	query := `
UNWIND $rows AS row
MERGE (s:Student {id: row.student_id})
SET s.name = row.student_name
MERGE (kp:KnowledgePoint {id: row.kp_id})
SET kp.name = row.kp_name,
    kp.group = row.kp_group
MERGE (s)-[m:MASTERED]->(kp)
SET m.score = row.score,
    m.updated_at = timestamp()
`
	rows := make([]map[string]interface{}, 0, len(students)*len(heatmapKnowledgePointSeeds))
	for _, student := range students {
		for index, kp := range heatmapKnowledgePointSeeds {
			rows = append(rows, map[string]interface{}{
				"student_id":   strconv.FormatInt(student.ID, 10),
				"student_name": studentNameMap[student.ID],
				"kp_id":        kp.ID,
				"kp_name":      kp.Name,
				"kp_group":     kp.Group,
				"score":        kp.Score - float64(index)*0.03 + float64(student.ID%3)*0.01,
			})
		}
	}

	if _, err := session.Run(ctx, query, map[string]interface{}{"rows": rows}); err != nil {
		return fmt.Errorf("写入Neo4j heatmap数据失败: %w", err)
	}

	utils.Infof("Neo4j heatmap 初始化完成，共写入 %d 条掌握关系", len(rows))
	return nil
}
