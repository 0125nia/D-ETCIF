// Package service
// D-ETCIF-backend/internal/service/experiment.go
package service

import (
	"D-ETCIF-backend/internal/model"

	"gorm.io/gorm"
)

type ExperimentService struct {
	db *gorm.DB
}

func NewExperimentService(db *gorm.DB) *ExperimentService {
	return &ExperimentService{db: db}
}

func (s *ExperimentService) GetExperimentDetails() ([]model.ExperimentDetails, error) {
	var details []model.ExperimentDetails

	if err := s.db.Find(&details).Error; err != nil {
		return nil, err
	}
	return details, nil
}

func (s *ExperimentService) CreateExperiment(experiment *model.Experiment) error {
	return s.db.Create(experiment).Error
}

func (s *ExperimentService) UpdateExperimentStage(userID int64, experimentID int64, stage int) error {
	return s.db.Model(&model.Experiment{}).Where("user_id = ? AND experiment_id = ?", userID, experimentID).Update("stage", stage).Error
}

func (s *ExperimentService) GetExperimentStagesByUserID(userID int64) ([]model.Experiment, error) {
	var experiments []model.Experiment

	if err := s.db.Where("user_id = ?", userID).Find(&experiments).Error; err != nil {
		return nil, err
	}
	return experiments, nil
}

func (s *ExperimentService) GetExperimentStage(userID int64, experimentID int64) (*model.Experiment, error) {
	var experiment model.Experiment

	if err := s.db.Where("user_id = ? AND experiment_id = ?", userID, experimentID).First(&experiment).Error; err != nil {
		return nil, err
	}
	return &experiment, nil
}

func (s *ExperimentService) GetExperimentStagesByExpID(expID int64) ([]model.Experiment, error) {
	var exps []model.Experiment
	err := s.db.Where("experiment_id = ?", expID).Find(&exps).Error
	return exps, err
}

func (s *ExperimentService) CheckDoingStageDone(userID int64, experimentID int64) (bool, error) {
	var experiment model.Experiment
	if err := s.db.Where("user_id = ? AND experiment_id = ?", userID, experimentID).First(&experiment).Error; err != nil {
		return false, err
	}
	// 这里的逻辑可以根据实际需求调整，比如检查某个字段是否满足条件等
	return experiment.Stage >= 2, nil // 假设阶段2及以上才算达标
}
