// Package controller
// D-ETCIF-backend/internal/controller/dashboard.go
package controller

import (
	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

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
		utils.InternalServerError(c, err.Error())
		return
	}
	utils.Success(c, data)
}

func (dc *DashboardController) GetBehavior(c *gin.Context) {
	data, err := dc.service.GetBehaviorData()
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}
	utils.Success(c, data)
}

func (dc *DashboardController) GetWarning(c *gin.Context) {
	data, err := dc.service.GetWarningData(c.Request.Context())
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}
	utils.Success(c, data)
}
