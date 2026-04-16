// Package controller
// D-ETCIF-backend/internal/controller/help.go
package controller

import (
	config "D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type HelpController struct {
	hs *service.HelpService
}

func NewHelpController() *HelpController {
	return &HelpController{
		hs: service.NewHelpService(config.DB),
	}
}

func (hc *HelpController) GetHelpDetails(c *gin.Context) {
	details, err := hc.hs.GetHelpDetails()
	if err != nil {
		utils.InternalServerError(c, "Failed to retrieve help resources")
		return
	}
	utils.Success(c, gin.H{"details": details})
}

func (hc *HelpController) CreateHelpDetail(c *gin.Context) {
	var helpDetail model.HelpDetail
	if err := c.ShouldBindJSON(&helpDetail); err != nil {
		utils.BadRequest(c, "Invalid request body")
		return
	}
	if err := hc.hs.CreateHelpDetail(&helpDetail); err != nil {
		utils.InternalServerError(c, "Failed to create help detail")
		return
	}
	utils.Success(c, gin.H{"message": "Help detail created successfully"})
}
