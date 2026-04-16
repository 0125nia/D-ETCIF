// Package service
// D-ETCIF-backend/internal/service/behavior_dispatch.go
package service

import (
	"time"

	"D-ETCIF-backend/internal/model"
)

func PublishBehaviorEvent(event *model.BehaviorEvent) {
	GlobalBehaviorEventBus.Publish(event)
}

func PublishSummarySubmitted(studentID, experimentID, status, learningContent, problemsSolved string) {
	PublishBehaviorEvent(&model.BehaviorEvent{
		Kind:         model.BehaviorKindSummarySubmit,
		Stage:        "post",
		Source:       "experiment_summary",
		StudentID:    studentID,
		ExperimentID: experimentID,
		ActionType:   "summary_submit",
		OccurredAt:   time.Now(),
		Payload: map[string]interface{}{
			"status":           status,
			"learning_content": learningContent,
			"problems_solved":  problemsSolved,
		},
	})
}

func PublishReportUploaded(studentID, experimentID, fileName, filePath string) {
	PublishBehaviorEvent(&model.BehaviorEvent{
		Kind:         model.BehaviorKindReportUpload,
		Stage:        "post",
		Source:       "experiment_report",
		StudentID:    studentID,
		ExperimentID: experimentID,
		ActionType:   "report_upload",
		OccurredAt:   time.Now(),
		Payload: map[string]interface{}{
			"file_name": fileName,
			"file_path": filePath,
		},
	})
}
