package controller

import (
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type IPythonController struct {
	fbs *service.FeedbackService
}

func NewIPythonController() *IPythonController {
	return &IPythonController{
		fbs: service.NewFeedbackService(),
	}
}

func (ipc *IPythonController) CollectMsgFromIPython(c *gin.Context) {
	var log model.ExecutionLog

	if err := c.ShouldBindJSON(&log); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// 1. 实时反馈引擎：根据预设规则检查代码和错误，生成反馈
	ipc.fbs.RealtimeFeedback(&log)

	// 2. 策略引导引擎：如果连续多次失败，触发策略反馈
	ipc.fbs.StrategyFeedback(&log)

	// 存入 MySQL 或 Neo4j，用于后续的评价算法
	utils.Infof("%+v", log)
	utils.Infof("收到执行数据: Cell #%d, 成功: %v", log.ExecutionCount, log.Success)
	c.JSON(200, gin.H{"status": "captured"})
}
