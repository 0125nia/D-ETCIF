// Package service
// D-ETCIF-backend/internal/service/post.go
package service

import (
	"D-ETCIF-backend/internal/model"

	"gorm.io/gorm"
)

type PostService struct {
	db *gorm.DB
}

func NewPostService(db *gorm.DB) *PostService {
	return &PostService{db: db}
}

func (s *PostService) GetPostExperimentData(experimentID int64) ([]*model.PostExperimentData, error) {
	var data []*model.PostExperimentData
	err := s.db.Where("experiment_id = ?", experimentID).Find(&data).Error
	if err != nil {
		return nil, err
	}
	return data, nil
}
