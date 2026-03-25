package controller

import (
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type IPythonController struct {
	wss *service.WebSocketService
}

func NewIPythonController() *IPythonController {
	return &IPythonController{
		wss: service.NewWebSocketService(),
	}
}

func (ipc *IPythonController) CollectMsgFromIPython(c *gin.Context) {
	var log struct {
		StudentID      string `json:"student_id"`
		ExperimentID   string `json:"experiment_id"`
		CellContent    string `json:"cell_content"`
		ExecutionCount int    `json:"execution_count"`
		Success        bool   `json:"success"`
		Error          string `json:"error"`
	}

	if err := c.ShouldBindJSON(&log); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	env := map[string]interface{}{
		"CellContent": log.CellContent,
		"Error":       log.Error,
		"Success":     log.Success,
	}

	alerts := service.CheckRules(env)

	if len(alerts) > 0 {
		ipc.wss.SendAlert(log.StudentID, "REALTIME_FEEDBACK", alerts)
	}

	// 存入 MySQL 或 Neo4j，用于后续的评价算法
	utils.Infof("%+v", log)
	utils.Infof("收到执行数据: Cell #%d, 成功: %v", log.ExecutionCount, log.Success)
	c.JSON(200, gin.H{"status": "captured"})
}
