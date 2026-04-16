// Package controller
// D-ETCIF-backend/internal/controller/profile.go
package controller

import (
	"fmt"

	db_config "D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type ProfileController struct {
	profileService *service.ProfileService
}

func NewProfileController() *ProfileController {
	if db_config.DB == nil {
		panic("db_config.DB is nil")
	}
	if db_config.Neo4jDriver == nil {
		panic("db_config.Neo4jDriver is nil")
	}
	return &ProfileController{
		profileService: service.NewProfileService(
			db_config.DB,
			db_config.Neo4jDriver,
		),
	}
}

func (pc *ProfileController) GetCognitiveMap(c *gin.Context) {
	studentID, exists := c.Get("userID")
	var studentIDStr string
	if !exists {
		studentIDStr = "test_student" // 容错
	} else {
		// 处理 userID 为 int64 类型的情况
		if idInt, ok := studentID.(int64); ok {
			studentIDStr = fmt.Sprintf("%d", idInt)
		} else if idStr, ok := studentID.(string); ok {
			studentIDStr = idStr
		} else {
			studentIDStr = "test_student"
		}
	}

	if pc.profileService == nil {
		utils.InternalServerError(c, "profileService is nil")
		return
	}

	// 检查 c.Request 是否为 nil
	if c.Request == nil {
		utils.InternalServerError(c, "c.Request is nil")
		return
	}

	data, err := pc.profileService.GetCognitiveMap(c.Request.Context(), studentIDStr)
	if err != nil {
		utils.InternalServerError(c, "获取认知图谱失败")
		return
	}

	utils.Success(c, data)
}

func (pc *ProfileController) GetStudyReport(c *gin.Context) {
	studentID, exists := c.Get("userID")
	var studentIDStr string
	if !exists {
		studentIDStr = "test_student"
	} else {
		// 处理 userID 为 int64 类型的情况
		if idInt, ok := studentID.(int64); ok {
			studentIDStr = fmt.Sprintf("%d", idInt)
		} else if idStr, ok := studentID.(string); ok {
			studentIDStr = idStr
		} else {
			studentIDStr = "test_student"
		}
	}

	data, err := pc.profileService.GetStudyReport(studentIDStr)
	if err != nil {
		utils.InternalServerError(c, "获取学习报告失败")
		return
	}

	utils.Success(c, data)
}

func (pc *ProfileController) GetRecommendations(c *gin.Context) {
	studentID, exists := c.Get("userID")
	var studentIDStr string
	if !exists {
		studentIDStr = "test_student"
	} else {
		// 处理 userID 为 int64 类型的情况
		if idInt, ok := studentID.(int64); ok {
			studentIDStr = fmt.Sprintf("%d", idInt)
		} else if idStr, ok := studentID.(string); ok {
			studentIDStr = idStr
		} else {
			studentIDStr = "test_student"
		}
	}
	data, err := pc.profileService.GetRecommendations(studentIDStr)
	if err != nil {
		utils.InternalServerError(c, "获取推荐失败")
		return
	}

	utils.Success(c, data)
}
