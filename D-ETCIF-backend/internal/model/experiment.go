// Package model
// D-ETCIF-backend/internal/model/experiment.go
package model

type Experiment struct {
	ID           int64 `gorm:"primaryKey;autoIncrement" json:"id"`
	ExperimentID int64 `gorm:"not null" json:"experiment_id"`
	UserID       int64 `gorm:"not null" json:"user_id"`
	Stage        int   `gorm:"not null" json:"stage"` // 1: 实验前, 2: 实验中, 3: 实验后 4: 已完成
}
