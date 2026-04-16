// Package controller
// D-ETCIF-backend/internal/controller/experiment.go
package controller

import (
	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type ExperimentController struct {
	es *service.ExperimentService
}

func NewExperimentController() *ExperimentController {
	return &ExperimentController{
		es: service.NewExperimentService(config.DB),
	}
}

func (c *ExperimentController) GetExperimentDetails(ctx *gin.Context) {
	details, err := c.es.GetExperimentDetails()
	if err != nil {
		utils.InternalServerError(ctx, "获取实验详情失败")
		return
	}
	utils.Success(ctx, details)
}

func (c *ExperimentController) GetExperimentStageByUserID(ctx *gin.Context) {
	// 获取用户ID
	userID, _ := ctx.Get("userID")

	experiments, err := c.es.GetExperimentStagesByUserID(userID.(int64))
	if err != nil {
		utils.InternalServerError(ctx, "获取实验阶段失败")
		return
	}
	utils.Success(ctx, experiments)
}

func (c *ExperimentController) UpdateExperimentStage(ctx *gin.Context) {
	// 获取用户ID
	userID, _ := ctx.Get("userID")

	var req struct {
		ExperimentID int64 `json:"experiment_id"`
		NewStage     int   `json:"new_stage"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "请求参数错误")
		return
	}

	err := c.es.UpdateExperimentStage(userID.(int64), req.ExperimentID, req.NewStage)
	if err != nil {
		utils.InternalServerError(ctx, "更新实验阶段失败")
		return
	}
	utils.Success(ctx, gin.H{"message": "实验阶段更新成功"})
}

func (c *ExperimentController) EnterExperiment(ctx *gin.Context) {
	// 获取用户ID
	userID, _ := ctx.Get("userID")

	expIDStr := ctx.Param("experiment_id")
	experimentID, err := utils.ParseInt64WithErr(expIDStr)
	if err != nil {
		utils.BadRequest(ctx, "实验ID格式错误")
		return
	}

	// 查询用户的实验阶段
	experiment, err := c.es.GetExperimentStage(userID.(int64), experimentID)
	if err != nil {
		// 如果没有实验记录，创建一条新的记录，阶段为1
		newExperiment := &model.Experiment{
			UserID:       userID.(int64),
			ExperimentID: experimentID,
			Stage:        1,
		}
		c.es.CreateExperiment(newExperiment)
		utils.Success(ctx, gin.H{"message": "进入实验成功", "current_stage": 1})
		return
	}

	// 返回当前阶段
	utils.Success(ctx, gin.H{"current_stage": experiment.Stage})
}

func (c *ExperimentController) CheckDoingStageDone(ctx *gin.Context) {
	// 获取用户ID
	userID, _ := ctx.Get("userID")

	expIDStr := ctx.Param("experimentId")
	experimentID, err := utils.ParseInt64WithErr(expIDStr)
	if err != nil {
		utils.BadRequest(ctx, "实验ID格式错误")
		return
	}

	canMove, err := c.es.CheckDoingStageDone(userID.(int64), experimentID)
	if err != nil {
		utils.InternalServerError(ctx, "检查阶段状态失败")
		return
	}
	utils.Success(ctx, gin.H{"can_move": canMove, "message": "ok"})
}
