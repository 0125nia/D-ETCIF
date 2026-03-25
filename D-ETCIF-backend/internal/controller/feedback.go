// Package controller
// D-ETCIF-backend/internal/controller/feedback.go
package controller

import (
	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type FeedbackController struct {
	ruleService *service.RuleService
}

func NewFeedbackController() *FeedbackController {
	return &FeedbackController{ruleService: service.NewRuleService(config.DB)}
}

func CollectMsgFromIPython(c *gin.Context) {
}
