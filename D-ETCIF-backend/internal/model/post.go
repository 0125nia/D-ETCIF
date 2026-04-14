// Package model
// D-ETCIF-backend/internal/model/post.go
package model

type PostExperimentData struct {
	ID             int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	ExperimentID   int64  `gorm:"not null" json:"experiment_id"`
	ExperimentName string `gorm:"type:varchar(255);not null" json:"experiment_name"`
	Question       string `gorm:"type:varchar(255)" json:"questions"`
	Options        string `gorm:"type:varchar(255)" json:"options"`
	Answer         string `gorm:"type:varchar(255)" json:"answer"`
}
