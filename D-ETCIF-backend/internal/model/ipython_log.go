// Package model
// D-ETCIF-backend/internal/model/ipython_log.go
package model

import "time"

type ExecutionLog struct {
	ID             int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	StudentID      string    `gorm:"type:varchar(100);index" json:"studentId"`
	ExperimentID   string    `gorm:"type:varchar(100);index" json:"experimentId"`
	CellContent    string    `gorm:"type:longtext" json:"cell_content"`
	ExecutionCount int       `json:"execution_count"`
	Success        bool      `json:"success"`
	Error          string    `gorm:"type:text" json:"error"`
	CreatedAt      time.Time `json:"created_at"`
}
