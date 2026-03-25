// Package service
// D-ETCIF-backend/internal/service/rule.go
package service

import "gorm.io/gorm"

type log struct {
	CellContent string `json:"cell_content"`
	Success     bool   `json:"success"`
	Error       string `json:"error"`
}

type RuleService struct {
	db *gorm.DB
}

func NewRuleService(db *gorm.DB) *RuleService {
	return &RuleService{db: db}
}
