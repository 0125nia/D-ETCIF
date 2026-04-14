// Package controller
// D-ETCIF-backend/internal/controller/dashboard.go
package controller

import (
	"net/http"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	service *service.DashboardService
}

func NewDashboardController() *DashboardController {
	return &DashboardController{service: service.NewDashboardService(
		config.DB,
		config.Neo4jDriver,
	)}
}

func (dc *DashboardController) GetHeatmap(c *gin.Context) {
	data, err := dc.service.GetHeatmapData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (dc *DashboardController) GetBehavior(c *gin.Context) {
	data, err := dc.service.GetBehaviorData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (dc *DashboardController) GetWarning(c *gin.Context) {
	data, err := dc.service.GetWarningData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}
