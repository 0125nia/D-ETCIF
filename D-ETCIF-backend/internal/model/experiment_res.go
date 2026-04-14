// Package model
// D-ETCIF-backend/internal/model/experiment_res.go
package model

type ExperimentReport struct {
	ID           int64  `gorm:"primaryKey" json:"id"`
	UserID       int64  `gorm:"index;not null" json:"user_id"`
	ExperimentID int64  `gorm:"index;not null" json:"experiment_id"`
	FileName     string `gorm:"type:varchar(255)" json:"file_name"` // 原始文件名
	FilePath     string `gorm:"type:varchar(512)" json:"file_path"` // 服务器存储路径
	Status       int    `gorm:"default:1" json:"status"`            // 1: 已上传, 2: 已批阅
	CreatedAt    int64  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    int64  `gorm:"autoUpdateTime" json:"updated_at"`
}

// ExperimentSummary 对应学生填写的实验总结
type ExperimentSummary struct {
	ID              int64  `gorm:"primaryKey" json:"id"`
	UserID          int64  `gorm:"index;not null" json:"user_id"`
	ExperimentID    int64  `gorm:"index;not null" json:"experiment_id"`
	LearningContent string `gorm:"type:text" json:"learning_content"`
	ProblemsSolved  string `gorm:"type:text" json:"problems_solved"`
	Status          string `gorm:"type:varchar(20);default:'draft'" json:"status"` // draft 或 submitted
}

// OperationResult 存储实验中阶段的自动化评分结果
type OperationResult struct {
	ID             int64   `gorm:"primaryKey" json:"id"`
	UserID         int64   `gorm:"index" json:"user_id"`
	ExperimentID   int64   `gorm:"index" json:"experiment_id"`
	OperationScore float64 `gorm:"type:decimal(5,2)" json:"operation_score"`
}

// StudentExperimentOverview 用于教师查看某个实验的学生提交概况
// 不需要存储在数据库中
type StudentExperimentOverview struct {
	UserID         int64   `json:"user_id"`
	ExperimentID   int64   `json:"experiment_id"`
	CurrentStage   int     `json:"current_stage"`
	OperationScore float64 `json:"operation_score"`
	SummaryStatus  string  `json:"summary_status"` // draft, submitted, empty
	HasReport      bool    `json:"has_report"`
}
