// Package router
// D-ETCIF-backend/internal/router/router.go
package router

import (
	"net/http"

	"D-ETCIF-backend/internal/controller"
	"D-ETCIF-backend/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	ginRouter := gin.Default()
	ginRouter.Use(middleware.Cors())
	ginRouter.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	})
	ginRouter.Static("/uploads", "./static/uploads")

	ginRouter.POST("/api/v1/monitor/collect", controller.NewIPythonController().CollectMsgFromIPython)

	api := ginRouter.Group("/api")
	{
		api.POST("/login", controller.NewLoginController().Login)
	}

	// ginRouter.GET("/ws/:studentId", controller.NewWebSocketController().HandleWebSocket)

	// 需要登录态的接口
	auth := ginRouter.Group("/api")
	auth.Use(middleware.JWTAuth())
	{
		// 学生侧
		student := auth.Group("/student")
		student.Use(middleware.RequireRole(1))
		{
			expCtrl := controller.NewExperimentController()
			student.GET("/experiment/details", expCtrl.GetExperimentDetails)
			student.GET("/experiment/stages", expCtrl.GetExperimentStageByUserID)
			student.POST("/experiment/stage/update", expCtrl.UpdateExperimentStage)
			student.GET("/experiment/enter/:experiment_id", expCtrl.EnterExperiment)

			dataCtrl := controller.NewExperimentDataController()
			// 数据相关
			student.GET("/experiment/pre/:experiment_id", dataCtrl.GetPreExperimentData)
			student.GET("/experiment/doing/:experiment_id", dataCtrl.GetDoingExperimentData)
			student.GET("/experiment/post/:experiment_id", dataCtrl.GetPostExperimentData)

			resCtrl := controller.NewExperimentResultController()
			// 结果相关
			student.GET("/experiment/operation-result/:experiment_id", resCtrl.GetOperationResult)
			student.GET("/experiment/summary/:experiment_id", resCtrl.GetExperimentSummary)
			student.POST("/experiment/summary/:experiment_id", resCtrl.SaveExperimentSummary)
			student.POST("/experiment/upload-report", resCtrl.UploadReport)

			helpController := controller.NewHelpController()
			student.GET("/help", helpController.CreateHelpDetail)
			// // 埋点路由
			// trackerController := controller.NewTrackerController()
			// student.POST("/tracker/pre", trackerController.TrackPre)
			// student.POST("/tracker/mid", trackerController.TrackMid)
			// student.POST("/tracker/post", trackerController.TrackPost)

			// 个人画像路由
			profileCtrl := controller.NewProfileController()
			student.GET("/profile/cognitive-map", profileCtrl.GetCognitiveMap)
			student.GET("/profile/report", profileCtrl.GetStudyReport)
			student.GET("/profile/recommendations", profileCtrl.GetRecommendations)
		}

		// 教师侧
		teacher := auth.Group("/teacher")
		teacher.Use(middleware.RequireRole(2))
		{

			resCtrl := controller.NewExperimentResultController()
			// 教师查看全班概览
			teacher.GET("/experiment/results/:experiment_id", resCtrl.GetAllStudentResults)
			// 教师查看单个学生详细产出（含分数、总结、报告）
			teacher.GET("/experiment/result/detail", resCtrl.GetStudentResultDetail)

			helpCtrl := controller.NewHelpController()
			teacher.GET("/help", helpCtrl.GetHelpDetails)
			// teacher.GET("/ping", func(c *gin.Context) {
			// 	c.JSON(http.StatusOK, gin.H{"message": "teacher ok"})
			// })

			dashCtrl := controller.NewDashboardController()
			teacher.GET("/dashboard/heatmap", dashCtrl.GetHeatmap)
			teacher.GET("/dashboard/behavior", dashCtrl.GetBehavior)
			teacher.GET("/dashboard/warning", dashCtrl.GetWarning)

			// // 仪表盘路由
			// dashboardController := controller.NewDashboardController()
			// teacher.GET("/dashboard/heatmap", dashboardController.GetHeatmap)
			// teacher.GET("/dashboard/warning", dashboardController.GetWarningData)
			// teacher.GET("/dashboard/behavior", dashboardController.GetBehaviorAnalysis)
		}
	}

	return ginRouter
}
