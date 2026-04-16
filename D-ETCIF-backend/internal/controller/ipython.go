// Package controller
// D-ETCIF-backend/internal/controller/ipython.go
package controller

import (
	"net/http"
	"strconv"
	"strings"

	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

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
		utils.BadRequest(c, "无效的参数")
		return
	}

	userIDValue, exists := c.Get("userID")
	if !exists {
		utils.Unauthorized(c, "未授权")
		return
	}

	userID, ok := userIDValue.(int64)
	if !ok {
		utils.Unauthorized(c, "用户身份无效")
		return
	}

	authStudentID := strconv.FormatInt(userID, 10)
	if strings.TrimSpace(log.StudentID) != "" && strings.TrimSpace(log.StudentID) != authStudentID {
		c.JSON(http.StatusForbidden, utils.Response{
			Code:    http.StatusForbidden,
			Message: "studentId 与登录身份不一致",
			Data:    nil,
		})
		return
	}
	log.StudentID = authStudentID

	if strings.TrimSpace(log.ExperimentID) == "" {
		utils.BadRequest(c, "experimentId 不能为空")
		return
	}

	if err := ipc.executionLogService.Save(&log); err != nil {
		utils.InternalServerError(c, "执行日志保存失败")
		return
	}

	service.GlobalExecutionLogBus.Publish(&log)

	utils.Infof("收到执行数据: student=%s experiment=%s cell=%d success=%v", log.StudentID, log.ExperimentID, log.ExecutionCount, log.Success)
	utils.Success(c, gin.H{"status": "captured"})
}
