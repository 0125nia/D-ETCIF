// Package model
// D-ETCIF-backend/internal/model/ws_feedback.go
package model

const (
	WSFeedbackTypeRealtime = "REALTIME_FEEDBACK"
	WSFeedbackTypeStrategy = "STRATEGY_FEEDBACK"
	WSFeedbackTypeSummary  = "SUMMARY_FEEDBACK"
)

const (
	FeedbackLevelRealtime = 1
	FeedbackLevelStrategy = 2
	FeedbackLevelSummary  = 3
)

const (
	FeedbackDisplayDoingPanel   = "doing.right"
	FeedbackDisplayFeedbackPage = "feedback.page"
	FeedbackDisplayProfilePage  = "profile.page"
)
