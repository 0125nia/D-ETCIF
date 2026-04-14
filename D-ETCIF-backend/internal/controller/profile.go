// Package controller
// D-ETCIF-backend/internal/controller/profile.go
package controller

import (
	"net/http"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type ProfileController struct {
	profileService *service.ProfileService
}

func NewProfileController() *ProfileController {
	return &ProfileController{
		profileService: service.NewProfileService(
			config.DB,
			config.Neo4jDriver,
		),
	}
}

func (pc *ProfileController) GetCognitiveMap(c *gin.Context) {
	studentID, exists := c.Get("userID")
	if !exists {
		studentID = "test_student" // 容错
	}

	data, err := pc.profileService.GetCognitiveMap(c.Request.Context(), studentID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取认知图谱失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (pc *ProfileController) GetStudyReport(c *gin.Context) {
	studentID, exists := c.Get("userID")
	if !exists {
		studentID = "test_student"
	}

	data, err := pc.profileService.GetStudyReport(studentID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取学习报告失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (pc *ProfileController) GetRecommendations(c *gin.Context) {
	studentID, _ := c.Get("userID")
	data, err := pc.profileService.GetRecommendations(studentID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取推荐失败"})
		return
	}
	// 注意：这里返回 { "data": [...] } 结构，与前端 res.data.data 匹配
	c.JSON(http.StatusOK, gin.H{"data": data})
}
