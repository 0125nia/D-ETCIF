// Package controller
// D-ETCIF-backend/internal/controller/experiment_res.go
package controller

import (
	"fmt"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type ExperimentResultController struct {
	ers *service.ExperimentResService
	es  *service.ExperimentService
}

func NewExperimentResultController() *ExperimentResultController {
	return &ExperimentResultController{
		ers: service.NewExperimentResService(config.DB),
		es:  service.NewExperimentService(config.DB),
	}
}

// GetExperimentSummary 获取总结草稿
func (e *ExperimentResultController) GetExperimentSummary(ctx *gin.Context) {
	userID, _ := ctx.Get("userID")
	expID, _ := utils.ParseInt64WithErr(ctx.Param("experiment_id"))

	summary, err := e.ers.GetSummary(userID.(int64), expID)
	if err != nil {
		utils.Success(ctx, nil) // 没找到不报错，返回空即可
		return
	}
	utils.Success(ctx, summary)
}

// SaveExperimentSummary 保存或提交总结
func (e *ExperimentResultController) SaveExperimentSummary(ctx *gin.Context) {
	userID, _ := ctx.Get("userID")
	expID, _ := utils.ParseInt64WithErr(ctx.Param("experiment_id"))
	uid := userID.(int64)

	var req struct {
		LearningContent string `json:"learning_content"`
		ProblemsSolved  string `json:"problems_solved"`
		Action          string `json:"action"` // "save" 或 "submit"
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "参数错误")
		return
	}

	status := "draft"
	if req.Action == "submit" {
		status = "submitted"
	}

	summary := &model.ExperimentSummary{
		UserID:          uid,
		ExperimentID:    expID,
		LearningContent: req.LearningContent,
		ProblemsSolved:  req.ProblemsSolved,
		Status:          status,
	}

	if err := e.ers.SaveSummary(summary); err != nil {
		utils.InternalServerError(ctx, "保存失败")
		return
	}

	if req.Action == "submit" {
		service.PublishSummarySubmitted(fmt.Sprint(uid), fmt.Sprint(expID), status, req.LearningContent, req.ProblemsSolved)
	}
	utils.Success(ctx, gin.H{"message": "操作成功"})
}

// GetOperationResult 获取操作阶段分数
func (e *ExperimentResultController) GetOperationResult(ctx *gin.Context) {
	userID, _ := ctx.Get("userID")
	expID, _ := utils.ParseInt64WithErr(ctx.Param("experiment_id"))

	result, err := e.ers.GetOperationScore(userID.(int64), expID)
	if err != nil {
		// 如果没找到，可能实验还没开始，默认给个45分作为基准或0分
		utils.Success(ctx, gin.H{"operation_score": 45.0})
		return
	}
	utils.Success(ctx, result)
}

// UploadReport 上传报告文件
func (e *ExperimentResultController) UploadReport(ctx *gin.Context) {
	file, _ := ctx.FormFile("reportFile")
	expID, _ := utils.ParseInt64WithErr(ctx.PostForm("experimentId"))
	userID, _ := ctx.Get("userID")
	uid := userID.(int64)

	dst := fmt.Sprintf("./static/uploads/%d_%d_%s", uid, expID, file.Filename)
	if err := ctx.SaveUploadedFile(file, dst); err != nil {
		utils.InternalServerError(ctx, "保存文件失败")
		return
	}

	report := &model.ExperimentReport{
		UserID: uid, ExperimentID: expID,
		FileName: file.Filename, FilePath: dst,
	}
	e.ers.SaveReportPath(report)
	service.PublishReportUploaded(fmt.Sprint(uid), fmt.Sprint(expID), file.Filename, dst)
	utils.Success(ctx, gin.H{"message": "上传成功"})
}

// 教师端

// GetAllStudentResults 获取全班某个实验的概览（通常用于列表显示）
func (e *ExperimentResultController) GetAllStudentResults(ctx *gin.Context) {
	expID, _ := utils.ParseInt64WithErr(ctx.Param("experiment_id"))

	// 1. 调用原子 Service 获取基础名单
	studentExps, err := e.es.GetExperimentStagesByExpID(expID)
	if err != nil {
		utils.InternalServerError(ctx, "获取实验名单失败")
		return
	}

	// 1.5 批量查询学生姓名，避免前端 username 为空
	studentIDs := make([]int64, 0, len(studentExps))
	for _, se := range studentExps {
		studentIDs = append(studentIDs, se.UserID)
	}

	userMap := make(map[int64]string, len(studentIDs))
	if len(studentIDs) > 0 {
		var users []model.User
		if err := config.DB.Where("id IN ?", studentIDs).Find(&users).Error; err == nil {
			for _, u := range users {
				userMap[u.ID] = u.Name
			}
		}
	}

	// 2. 批量查询所有学生的相关数据，避免 N+1 查询
	var overviews []model.StudentExperimentOverview

	// 批量查询操作分数
	var operationResults []model.OperationResult
	opMap := make(map[int64]float64)
	if len(studentIDs) > 0 {
		operationResults, _ = e.ers.GetOperationScoresByExperiment(expID, studentIDs)
		for _, op := range operationResults {
			opMap[op.UserID] = op.OperationScore
		}
	}

	// 批量查询总结
	var summaries []model.ExperimentSummary
	summaryMap := make(map[int64]string)
	if len(studentIDs) > 0 {
		summaries, _ = e.ers.GetSummariesByExperiment(expID, studentIDs)
		for _, sum := range summaries {
			summaryMap[sum.UserID] = sum.Status
		}
	}

	// 批量查询报告
	var reports []model.ExperimentReport
	reportMap := make(map[int64]bool)
	if len(studentIDs) > 0 {
		reports, _ = e.ers.GetReportsByExperiment(expID, studentIDs)
		for _, rep := range reports {
			reportMap[rep.UserID] = true
		}
	}

	// 3. 组装概览数据
	for _, se := range studentExps {
		overview := model.StudentExperimentOverview{
			UserID:       se.UserID,
			Username:     userMap[se.UserID],
			ExperimentID: se.ExperimentID,
			CurrentStage: se.Stage, // 来自 experiments 表
		}

		// 从 map 中获取数据
		if score, ok := opMap[se.UserID]; ok {
			overview.OperationScore = score
		}

		if status, ok := summaryMap[se.UserID]; ok {
			overview.SummaryStatus = status
		} else {
			overview.SummaryStatus = "empty"
		}

		if _, ok := reportMap[se.UserID]; ok {
			overview.HasReport = true
		} else {
			overview.HasReport = false
		}

		overviews = append(overviews, overview)
	}

	utils.Success(ctx, overviews)
}

// GetStudentResultDetail 教师调阅：获取特定学生的所有实验产出
func (e *ExperimentResultController) GetStudentResultDetail(ctx *gin.Context) {
	// 教师通过 URL 参数传入目标学生 ID 和 实验 ID
	targetUserID, _ := utils.ParseInt64WithErr(ctx.Query("student_id"))
	expID, _ := utils.ParseInt64WithErr(ctx.Query("experiment_id"))

	// 并行或顺序获取三项核心数据
	summary, _ := e.ers.GetSummary(targetUserID, expID)
	report, _ := e.ers.GetReport(targetUserID, expID)
	opResult, _ := e.ers.GetOperationScore(targetUserID, expID)

	// 组装返回
	utils.Success(ctx, gin.H{
		"student_id":       targetUserID,
		"experiment_id":    expID,
		"summary":          summary,
		"report":           report,
		"operation_result": opResult, // 包含操作评分
	})
}
