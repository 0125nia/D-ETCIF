// Package controller
// D-ETCIF-backend/internal/controller/help.go
package controller

import (
	"net/http"

	config "D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve help resources"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"details": details})
}

func (hc *HelpController) CreateHelpDetail(c *gin.Context) {
	var helpDetail model.HelpDetail
	if err := c.ShouldBindJSON(&helpDetail); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	if err := hc.hs.CreateHelpDetail(&helpDetail); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create help detail"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Help detail created successfully"})
}
