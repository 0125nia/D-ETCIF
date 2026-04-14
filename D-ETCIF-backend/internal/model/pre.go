// Package model
// D-ETCIF-backend/internal/model/pre.go
package model

type PreExperimentData struct {
	ID              int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	ExperimentID    int64  `gorm:"not null" json:"experiment_id"`
	ExperimentName  string `gorm:"type:varchar(255);not null" json:"experiment_name"`
	SourceName      string `gorm:"type:varchar(50)" json:"source_name"`
	SourceChildName string `gorm:"type:varchar(50)" json:"source_child_name"`
	URL             string `gorm:"type:varchar(255)" json:"url"`
	Type            string `gorm:"type:varchar(50)" json:"type"`
}
