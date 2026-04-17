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

func resolveStudentID(c *gin.Context) (string, bool) {
	studentID, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	switch id := studentID.(type) {
	case int64:
		return fmt.Sprintf("%d", id), true
	case int:
		return fmt.Sprintf("%d", id), true
	case string:
		if id == "" {
			return "", false
		}
		return id, true
	default:
		return "", false
	}
}

func (pc *ProfileController) GetCognitiveMap(c *gin.Context) {
	studentIDStr, ok := resolveStudentID(c)
	if !ok {
		utils.Unauthorized(c, "未登录或用户标识无效")
		return
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
	studentIDStr, ok := resolveStudentID(c)
	if !ok {
		utils.Unauthorized(c, "未登录或用户标识无效")
		return
	}

	data, err := pc.profileService.GetStudyReport(studentIDStr)
	if err != nil {
		utils.InternalServerError(c, "获取学习报告失败")
		return
	}

	utils.Success(c, data)
}

func (pc *ProfileController) GetRecommendations(c *gin.Context) {
	studentIDStr, ok := resolveStudentID(c)
	if !ok {
		utils.Unauthorized(c, "未登录或用户标识无效")
		return
	}
	data, err := pc.profileService.GetRecommendations(studentIDStr)
	if err != nil {
		utils.InternalServerError(c, "获取推荐失败")
		return
	}

	utils.Success(c, data)
}
