// Package controller
// D-ETCIF-backend/internal/controller/ipython.go
package controller

import (
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type IPythonController struct {
	executionLogService *service.ExecutionLogService
}

func NewIPythonController() *IPythonController {
	return &IPythonController{
		executionLogService: service.NewExecutionLogService(),
	}
}

func (ipc *IPythonController) CollectMsgFromIPython(c *gin.Context) {
	var log model.ExecutionLog

	if err := c.ShouldBindJSON(&log); err != nil {
		c.JSON(400, gin.H{"error": "invalid params"})
		return
	}

	if err := ipc.executionLogService.Save(&log); err != nil {
		c.JSON(500, gin.H{"error": "save failed"})
		return
	}

	service.GlobalExecutionLogBus.Publish(&log)

	c.JSON(200, gin.H{"status": "ok"})
}
