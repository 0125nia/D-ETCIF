// Package model
// D-ETCIF-backend/internal/model/experiment_details.go
package model

type ExperimentDetails struct {
	ID           int64  `gorm:"primaryKey;autoIncrement:false" json:"id"`
	ExperimentID int64  `gorm:"not null" json:"experiment_id"`
	Name         string `gorm:"type:varchar(255);not null" json:"name"`
	Desc         string `gorm:"type:varchar(255)" json:"desc"`
	Difficulty   int    `gorm:"not null" json:"difficulty"`
}
