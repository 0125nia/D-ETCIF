// Package service
// D-ETCIF-backend/internal/service/experiment_res.go
package service

import (
	"D-ETCIF-backend/internal/model"
	"errors"

	"gorm.io/gorm"
)

type ExperimentResService struct {
	db *gorm.DB
}

const actionTypePostQuizSubmit = "post_quiz_submit"

func NewExperimentResService(db *gorm.DB) *ExperimentResService {
	return &ExperimentResService{db: db}
}

func (s *ExperimentResService) GetSummary(userID, expID int64) (*model.ExperimentSummary, error) {
	var summary model.ExperimentSummary
	err := s.db.Where("user_id = ? AND experiment_id = ?", userID, expID).First(&summary).Error
	return &summary, err
}

func (s *ExperimentResService) SaveSummary(summary *model.ExperimentSummary) error {
	// 使用 Upsert 逻辑：存在则更新，不存在则创建
	return s.db.Where("user_id = ? AND experiment_id = ?", summary.UserID, summary.ExperimentID).
		Assign(summary).
		FirstOrCreate(summary).Error
}

func (s *ExperimentResService) GetOperationScore(userID, expID int64) (*model.OperationResult, error) {
	var result model.OperationResult
	err := s.db.Where("user_id = ? AND experiment_id = ?", userID, expID).First(&result).Error
	return &result, err
}

func (s *ExperimentResService) GetLatestPostQuizSubmitScore(userID, expID int64) (float64, error) {
	var event model.PostEvent
	err := s.db.
		Where("student_id = ? AND experiment_id = ? AND action_type = ?", userID, expID, actionTypePostQuizSubmit).
		Order("created_at DESC, id DESC").
		First(&event).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, nil
		}
		return 0, err
	}
	return float64(event.Score), nil
}

// GetReport 获取报告
func (s *ExperimentResService) GetReport(userID, expID int64) (*model.ExperimentReport, error) {
	var report model.ExperimentReport
	err := s.db.Where("user_id = ? AND experiment_id = ?", userID, expID).First(&report).Error
	return &report, err
}

// SaveReportPath 记录或更新报告路径
func (s *ExperimentResService) SaveReportPath(report *model.ExperimentReport) error {
	// 逻辑：根据 UserID 和 ExperimentID 找记录，有则更新路径和文件名，无则创建
	return s.db.Where("user_id = ? AND experiment_id = ?", report.UserID, report.ExperimentID).
		Assign(model.ExperimentReport{
			FileName: report.FileName,
			FilePath: report.FilePath,
			Status:   1, // 重新上传后状态重置为已上传
		}).
		FirstOrCreate(report).Error
}

// GetResultsByExperiment 获取某个实验的所有学生提交情况（教师用）
func (s *ExperimentResService) GetResultsByExperiment(expID int64) ([]model.ExperimentReport, error) {
	var reports []model.ExperimentReport
	// 联表查询或直接查询报告表，取决于你是否需要展示学生姓名
	err := s.db.Where("experiment_id = ?", expID).Find(&reports).Error
	return reports, err
}

// GetOperationScoresByExperiment 批量获取实验操作分数
func (s *ExperimentResService) GetOperationScoresByExperiment(expID int64, userIDs []int64) ([]model.OperationResult, error) {
	var results []model.OperationResult
	err := s.db.Where("experiment_id = ? AND user_id IN ?", expID, userIDs).Find(&results).Error
	return results, err
}

// GetSummariesByExperiment 批量获取实验总结
func (s *ExperimentResService) GetSummariesByExperiment(expID int64, userIDs []int64) ([]model.ExperimentSummary, error) {
	var summaries []model.ExperimentSummary
	err := s.db.Where("experiment_id = ? AND user_id IN ?", expID, userIDs).Find(&summaries).Error
	return summaries, err
}

// GetReportsByExperiment 批量获取实验报告
func (s *ExperimentResService) GetReportsByExperiment(expID int64, userIDs []int64) ([]model.ExperimentReport, error) {
	var reports []model.ExperimentReport
	err := s.db.Where("experiment_id = ? AND user_id IN ?", expID, userIDs).Find(&reports).Error
	return reports, err
}
