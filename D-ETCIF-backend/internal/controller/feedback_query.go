// Package controller
// D-ETCIF-backend/internal/controller/feedback_query.go
package controller

import (
	"fmt"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type FeedbackQueryController struct {
	feedbackService *service.FeedbackRecordService
}

func NewFeedbackQueryController() *FeedbackQueryController {
	return &FeedbackQueryController{
		feedbackService: service.NewFeedbackRecordService(config.DB),
	}
}

func (fc *FeedbackQueryController) ListStudentFeedback(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		utils.Unauthorized(c, "未授权")
		return
	}

	userID, ok := userIDVal.(int64)
	if !ok {
		utils.Unauthorized(c, "用户身份无效")
		return
	}

	rows, err := fc.feedbackService.ListByStudent(fmt.Sprint(userID))
	if err != nil {
		utils.InternalServerError(c, "拉取反馈失败")
		return
	}

	groups := service.BuildFeedbackExperimentGroups(rows)
	utils.Success(c, groups)
}
