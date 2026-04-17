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

// resolveStudentID 解析登录上下文中的 userID，返回 studentID、失败原因、是否成功。
func resolveStudentID(c *gin.Context) (string, string, bool) {
	studentID, exists := c.Get("userID")
	if !exists {
		return "", "未登录", false
	}
	switch id := studentID.(type) {
	case int64:
		return fmt.Sprintf("%d", id), "", true
	case int:
		return fmt.Sprintf("%d", id), "", true
	case string:
		if id == "" {
			return "", "用户标识为空", false
		}
		return id, "", true
	default:
		return "", "用户标识类型无效", false
	}
}

func (pc *ProfileController) GetCognitiveMap(c *gin.Context) {
	studentIDStr, reason, ok := resolveStudentID(c)
	if !ok {
		utils.Unauthorized(c, reason)
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
	studentIDStr, reason, ok := resolveStudentID(c)
	if !ok {
		utils.Unauthorized(c, reason)
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
	studentIDStr, reason, ok := resolveStudentID(c)
	if !ok {
		utils.Unauthorized(c, reason)
		return
	}
	data, err := pc.profileService.GetRecommendations(studentIDStr)
	if err != nil {
		utils.InternalServerError(c, "获取推荐失败")
		return
	}

	utils.Success(c, data)
}
