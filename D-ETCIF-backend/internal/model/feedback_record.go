// Package model
// D-ETCIF-backend/internal/model/feedback_record.go
package model

type FeedbackRecord struct {
	ID           int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentID    string `gorm:"type:varchar(100);index" json:"student_id"`
	ExperimentID string `gorm:"type:varchar(100);index" json:"experiment_id"`

	FeedbackType string `gorm:"type:varchar(50);index" json:"feedback_type"`
	Title        string `gorm:"type:varchar(255)" json:"title"`
	Content      string `gorm:"type:longtext" json:"content"`
	Severity     string `gorm:"type:varchar(20)" json:"severity"`

	CodeSnippet   string `gorm:"type:longtext" json:"code_snippet"`
	KnowledgeLink string `gorm:"type:varchar(512)" json:"knowledge_link"`

	WSFeedbackType string `gorm:"type:varchar(50);index" json:"ws_feedback_type"`
	Level          int    `json:"level"`
	Display        string `gorm:"type:varchar(50)" json:"display"`
	Stage          string `gorm:"type:varchar(50)" json:"stage"`
	EventKind      string `gorm:"type:varchar(50)" json:"event_kind"`
	ActionType     string `gorm:"type:varchar(50)" json:"action_type"`

	CreatedAt int64 `gorm:"autoCreateTime:milli" json:"created_at"`
	UpdatedAt int64 `gorm:"autoUpdateTime:milli" json:"updated_at"`
}
