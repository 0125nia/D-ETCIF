// Package repository
// D-ETCIF-backend/internal/repository/profile_migration.go
package repository

import (
	"context"
	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// MigrateProfileData 为学生profile页面的接口添加测试数据
func MigrateProfileData() error {
	// 为MidEvent表添加测试数据
	if err := migrateMidEventData(); err != nil {
		utils.Errorf("迁移MidEvent数据失败: %v", err)
		return err
	}

	// 为PostEvent表添加测试数据
	if err := migratePostEventData(); err != nil {
		utils.Errorf("迁移PostEvent数据失败: %v", err)
		return err
	}

	// 为Neo4j添加学生知识点关系数据
	if err := migrateNeo4jData(); err != nil {
		utils.Errorf("迁移Neo4j数据失败: %v", err)
		return err
	}

	utils.Info("学生profile数据迁移完成")
	return nil
}

// migrateMidEventData 为MidEvent表添加测试数据
func migrateMidEventData() error {
	// 检查是否已有数据
	var count int64
	config.DB.Model(&model.MidEvent{}).Count(&count)
	if count > 0 {
		utils.Info("MidEvent表已有数据，跳过迁移")
		return nil
	}

	// 为测试学生添加数据
	testStudentIDs := []string{"test_student", "1"} // 添加userID为1的学生
	now := time.Now()

	// 测试数据
	var eventData []model.MidEvent
	for _, studentID := range testStudentIDs {
		eventData = append(eventData, []model.MidEvent{
			{
				StudentID:    studentID,
				ExperimentID: "1",
				ActionType:   "step_action",
				KpName:       "数据可视化基础",
				Score:        85.5,
				Content:      "完成了第一步操作",
				Duration:     15000, // 15秒
				CreatedAt:    now.Add(-24 * time.Hour),
			},
			{
				StudentID:    studentID,
				ExperimentID: "1",
				ActionType:   "error",
				KpName:       "数据可视化基础",
				Score:        0,
				Content:      "语法错误",
				Duration:     5000, // 5秒
				CreatedAt:    now.Add(-23 * time.Hour),
			},
			{
				StudentID:    studentID,
				ExperimentID: "1",
				ActionType:   "step_action",
				KpName:       "图表类型",
				Score:        90.0,
				Content:      "完成了第二步操作",
				Duration:     20000, // 20秒
				CreatedAt:    now.Add(-22 * time.Hour),
			},
			{
				StudentID:    studentID,
				ExperimentID: "1",
				ActionType:   "step_action",
				KpName:       "图表类型",
				Score:        88.0,
				Content:      "完成了第三步操作",
				Duration:     18000, // 18秒
				CreatedAt:    now.Add(-21 * time.Hour),
			},
			{
				StudentID:    studentID,
				ExperimentID: "2",
				ActionType:   "step_action",
				KpName:       "数据预处理",
				Score:        82.0,
				Content:      "完成了第一步操作",
				Duration:     25000, // 25秒
				CreatedAt:    now.Add(-12 * time.Hour),
			},
		}...)
	}

	if err := config.DB.Create(&eventData).Error; err != nil {
		return err
	}

	utils.Infof("MidEvent数据迁移完成，共 %d 条", len(eventData))
	return nil
}

// migratePostEventData 为PostEvent表添加测试数据
func migratePostEventData() error {
	// 检查是否已有数据
	var count int64
	config.DB.Model(&model.PostEvent{}).Count(&count)
	if count > 0 {
		utils.Info("PostEvent表已有数据，跳过迁移")
		return nil
	}

	// 为测试学生添加数据
	testStudentIDs := []string{"test_student", "1"} // 添加userID为1的学生
	now := time.Now()

	// 测试数据
	var eventData []model.PostEvent
	for _, studentID := range testStudentIDs {
		eventData = append(eventData, []model.PostEvent{
			{
				StudentID:    studentID,
				ExperimentID: "1",
				ActionType:   "finish_experiment",
				Score:        85,
				Content:      "完成了实验1",
				CreatedAt:    now.Add(-20 * time.Hour),
			},
			{
				StudentID:    studentID,
				ExperimentID: "2",
				ActionType:   "finish_experiment",
				Score:        90,
				Content:      "完成了实验2",
				CreatedAt:    now.Add(-10 * time.Hour),
			},
			{
				StudentID:    studentID,
				ExperimentID: "3",
				ActionType:   "finish_experiment",
				Score:        88,
				Content:      "完成了实验3",
				CreatedAt:    now.Add(-5 * time.Hour),
			},
		}...)
	}

	if err := config.DB.Create(&eventData).Error; err != nil {
		return err
	}

	utils.Infof("PostEvent数据迁移完成，共 %d 条", len(eventData))
	return nil
}

// migrateNeo4jData 为Neo4j添加学生知识点关系数据
func migrateNeo4jData() error {
	if config.Neo4jDriver == nil {
		utils.Info("Neo4j驱动不可用，跳过Neo4j数据迁移")
		return nil
	}

	ctx := context.Background()
	session := config.Neo4jDriver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	// 检查是否已有学生节点
	checkQuery := `MATCH (s:Student) RETURN count(s) as count`
	result, err := session.Run(ctx, checkQuery, nil)
	if err != nil {
		return err
	}

	if result.Next(ctx) {
		countValue, ok := result.Record().Values[0].(int64)
		if ok && countValue > 0 {
			utils.Info("Neo4j已有学生数据，跳过迁移")
			return nil
		}
	}

	// 创建学生节点和知识点节点，以及它们之间的关系
	createQuery := `
	// 创建学生节点
	CREATE (s1:Student {id: 'test_student', name: '测试学生'})
	CREATE (s2:Student {id: '1', name: '学生1'})

	// 创建知识点节点
	CREATE (kp1:KnowledgePoint {id: '1', name: '数据可视化基础', expid: 1})
	CREATE (kp2:KnowledgePoint {id: '2', name: '图表类型', expid: 1})
	CREATE (kp3:KnowledgePoint {id: '3', name: '数据预处理', expid: 2})
	CREATE (kp4:KnowledgePoint {id: '4', name: '数据可视化的定义与作用', expid: 1})
	CREATE (kp5:KnowledgePoint {id: '5', name: '12种常见可视化图表类型', expid: 1})

	// 创建学生与知识点的关系
	CREATE (s1)-[:MASTERED {score: 0.8}]->(kp1)
	CREATE (s1)-[:MASTERED {score: 0.6}]->(kp2)
	CREATE (s1)-[:MASTERED {score: 0.7}]->(kp3)
	CREATE (s1)-[:MASTERED {score: 0.5}]->(kp4)
	CREATE (s1)-[:MASTERED {score: 0.4}]->(kp5)

	CREATE (s2)-[:MASTERED {score: 0.85}]->(kp1)
	CREATE (s2)-[:MASTERED {score: 0.75}]->(kp2)
	CREATE (s2)-[:MASTERED {score: 0.65}]->(kp3)
	CREATE (s2)-[:MASTERED {score: 0.55}]->(kp4)
	CREATE (s2)-[:MASTERED {score: 0.45}]->(kp5)
	`

	_, err = session.Run(ctx, createQuery, nil)
	if err != nil {
		return err
	}

	utils.Info("Neo4j数据迁移完成")
	return nil
}
