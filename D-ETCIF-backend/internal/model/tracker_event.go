// Package model
// D-ETCIF-backend/internal/model/tracker_event.go
package model

import "time"

// PreEvent 实验前埋点（预习访问路径、知识点点击）
type PreEvent struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentID    string    `gorm:"type:varchar(100);index" json:"student_id"`
	ExperimentID string    `gorm:"type:varchar(100);index" json:"experiment_id"`
	ResourceID   string    `gorm:"type:varchar(100)" json:"resource_id"`   // 点击的资源/知识点
	ResourceName string    `gorm:"type:varchar(255)" json:"resource_name"` // 资源名称
	Path         string    `gorm:"type:text" json:"path"`                  // 访问路径/URL
	Duration     int       `json:"duration"`                               // 停留时长(毫秒)
	CreatedAt    time.Time `json:"created_at"`
}

// MidEvent 实验中埋点（操作步骤序列、求助触发、停留时长、路径选择、错误类型）
type MidEvent struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentID    string    `gorm:"type:varchar(100);index" json:"student_id"`
	ExperimentID string    `gorm:"type:varchar(100);index" json:"experiment_id"`
	ActionType   string    `gorm:"type:varchar(100)" json:"action_type"` // 操作类型: help_trigger, step_action, error, etc.
	KpName       string    `gorm:"column:kp_name;type:varchar(255);index" json:"kp_name"`
	Score        float64   `gorm:"type:decimal(5,2);default:0" json:"score"`
	Content      string    `gorm:"type:text" json:"content"` // 操作内容/错误详情
	Duration     int       `json:"duration"`                 // 停留时长/操作耗时(毫秒)
	CreatedAt    time.Time `json:"created_at"`
}

// PostEvent 实验后埋点（报告提交、测试作答、评分）
type PostEvent struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentID    string    `gorm:"type:varchar(100);index" json:"student_id"`
	ExperimentID string    `gorm:"type:varchar(100);index" json:"experiment_id"`
	ActionType   string    `gorm:"type:varchar(100)" json:"action_type"` // 动作类型: report_submit, test_answer, etc.
	Score        float32   `json:"score"`                                // 分数
	Content      string    `gorm:"type:text" json:"content"`             // 详情/评价内容
	CreatedAt    time.Time `json:"created_at"`
}
