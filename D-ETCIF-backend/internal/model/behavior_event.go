// Package model
// D-ETCIF-backend/internal/model/behavior_event.go
package model

import "time"

const (
	BehaviorKindExecutionLog  = "execution_log"
	BehaviorKindPreEvent      = "pre_event"
	BehaviorKindMidEvent      = "mid_event"
	BehaviorKindPostEvent     = "post_event"
	BehaviorKindSummarySubmit = "summary_submit"
	BehaviorKindReportUpload  = "report_upload"
)

type BehaviorEvent struct {
	Kind         string                 `json:"kind"`
	Stage        string                 `json:"stage"`
	Source       string                 `json:"source"`
	StudentID    string                 `json:"student_id"`
	ExperimentID string                 `json:"experiment_id"`
	ActionType   string                 `json:"action_type"`
	OccurredAt   time.Time              `json:"occurred_at"`
	Payload      map[string]interface{} `json:"payload"`
}
