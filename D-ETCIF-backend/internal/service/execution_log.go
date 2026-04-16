// Package service
// D-ETCIF-backend/internal/service/execution_log.go
package service

import (
	"fmt"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"
)

type ExecutionLogService struct{}

func NewExecutionLogService() *ExecutionLogService {
	return &ExecutionLogService{}
}

func (s *ExecutionLogService) Save(log *model.ExecutionLog) error {
	if config.DB == nil {
		return fmt.Errorf("database is not initialized")
	}

	if err := config.DB.Create(log).Error; err != nil {
		utils.Errorf("ExecutionLog 落库失败: %v", err)
		return err
	}

	return nil
}
