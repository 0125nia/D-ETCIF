// Package model
// D-ETCIF-backend/internal/model/help.go
package model

type HelpDetail struct {
	ID              int    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID          int    `gorm:"not null" json:"user_id"`
	ExperimentID    int    `gorm:"not null" json:"experiment_id"`
	ExperimentStage int    `gorm:"not null" json:"experiment_stage"`
	Title           string `gorm:"type:varchar(50)" json:"title"`
	Content         string `gorm:"type:varchar(255)" json:"content"`
	Status		  int    `gorm:"not null" json:"status"` // 0: 待处理, 1: 已处理
	CreatedAt       int64  `gorm:"autoCreateTime" json:"created_at"`
}
