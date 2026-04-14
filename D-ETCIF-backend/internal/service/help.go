// Package service
// D-ETCIF-backend/internal/service/help.go
package service

import (
	"D-ETCIF-backend/internal/model"

	"gorm.io/gorm"
)

type HelpService struct {
	db *gorm.DB
}

func NewHelpService(db *gorm.DB) *HelpService {
	return &HelpService{db: db}
}

func (hs *HelpService) GetHelpDetails() (*[]model.HelpDetail, error) {
	var details []model.HelpDetail
	if err := hs.db.Find(&details).Error; err != nil {
		return nil, err
	}
	return &details, nil
}

func (hs *HelpService) CreateHelpDetail(helpDetail *model.HelpDetail) error {
	return hs.db.Create(helpDetail).Error
}
