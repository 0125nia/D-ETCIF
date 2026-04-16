// Package service
// D-ETCIF-backend/internal/service/feedback_envelope.go
package service

import (
	"D-ETCIF-backend/internal/model"

	"github.com/gin-gonic/gin"
)

func buildFeedbackEnvelope(
	wsType string,
	level int,
	display string,
	event *model.BehaviorEvent,
	data interface{},
) gin.H {
	envelope := gin.H{
		"type":    wsType,
		"level":   level,
		"display": display,
		"data":    data,
	}

	if event != nil {
		envelope["stage"] = event.Stage
		envelope["event_kind"] = event.Kind
		envelope["action_type"] = event.ActionType
		envelope["experiment_id"] = event.ExperimentID
	}

	return envelope
}
