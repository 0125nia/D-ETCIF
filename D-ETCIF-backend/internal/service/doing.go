// Package service
// D-ETCIF-backend/internal/service/doing.go
package service

import (
	"D-ETCIF-backend/internal/model"

	"gorm.io/gorm"
)

type DoingService struct {
	db *gorm.DB
}

func NewDoingService(db *gorm.DB) *DoingService {
	return &DoingService{db: db}
}

func (s *DoingService) GetDoingExperimentData(experimentID int64) ([]*model.DoingExperimentData, error) {
	var data []*model.DoingExperimentData
	err := s.db.Where("experiment_id = ?", experimentID).Find(&data).Error
	if err != nil {
		return nil, err
	}
	return data, nil
}
