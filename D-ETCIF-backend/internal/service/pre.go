// Package service
// D-ETCIF-backend/internal/service/pre.go
package service

import (
	"D-ETCIF-backend/internal/model"

	"gorm.io/gorm"
)

type PreService struct {
	db *gorm.DB
}

func NewPreService(db *gorm.DB) *PreService {
	return &PreService{db: db}
}

func (s *PreService) GetPreExperimentData(experimentID int64) ([]*model.PreExperimentData, error) {
	var data []*model.PreExperimentData
	err := s.db.Where("experiment_id = ?", experimentID).Find(&data).Error
	if err != nil {
		return nil, err
	}
	return data, nil
}
