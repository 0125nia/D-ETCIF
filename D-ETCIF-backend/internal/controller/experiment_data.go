// Package controller
// D-ETCIF-backend/internal/controller/experiment_data.go
package controller

import (
	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type ExperimentDataController struct {
	prs *service.PreService
	ds  *service.DoingService
	pos *service.PostService
}

func NewExperimentDataController() *ExperimentDataController {
	return &ExperimentDataController{
		prs: service.NewPreService(config.DB),
		ds:  service.NewDoingService(config.DB),
		pos: service.NewPostService(config.DB),
	}
}

func (e *ExperimentDataController) GetPreExperimentData(ctx *gin.Context) {
	expIDStr := ctx.Param("experiment_id")
	experimentID, err := utils.ParseInt64WithErr(expIDStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "实验ID格式错误"})
		return
	}
	data, err := e.prs.GetPreExperimentData(experimentID)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "获取预实验数据失败"})
		return
	}
	ctx.JSON(200, gin.H{"data": data})
}

func (e *ExperimentDataController) GetDoingExperimentData(ctx *gin.Context) {
	expIDStr := ctx.Param("experiment_id")
	experimentID, err := utils.ParseInt64WithErr(expIDStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "实验ID格式错误"})
		return
	}
	data, err := e.ds.GetDoingExperimentData(experimentID)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "获取进行中实验数据失败"})
		return
	}
	ctx.JSON(200, gin.H{"data": data})
}

func (e *ExperimentDataController) GetPostExperimentData(ctx *gin.Context) {
	expIDStr := ctx.Param("experiment_id")
	experimentID, err := utils.ParseInt64WithErr(expIDStr)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "实验ID格式错误"})
		return
	}
	data, err := e.pos.GetPostExperimentData(experimentID)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "获取后续实验数据失败"})
		return
	}
	ctx.JSON(200, gin.H{"data": data})
}
