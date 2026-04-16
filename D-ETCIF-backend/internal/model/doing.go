// Package model
// D-ETCIF-backend/internal/model/doing.go
package model

type DoingExperimentData struct {
	ID             int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	ExperimentID   int64  `gorm:"not null" json:"experiment_id"`
	ExperimentName string `gorm:"type:varchar(255);not null" json:"experiment_name"`
	TopicDetails   string `gorm:"type:text" json:"topic_details"`
	Answer         string `gorm:"type:varchar(255)" json:"answer"`
}
