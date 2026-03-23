// Package router
// D-ETCIF-backend/internal/router/router.go
package router

import (
	"net/http"

	"D-ETCIF-backend/pkg/middleware"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	ginRouter := gin.Default()
	ginRouter.Use(middleware.Cors())
	ginRouter.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	})

	ginRouter.POST("/api/v1/monitor/collect", func(c *gin.Context) {
		var log struct {
			CellContent    string `json:"cell_content"`
			ExecutionCount int    `json:"execution_count"`
			Success        bool   `json:"success"`
			Error          string `json:"error"`
		}

		if err := c.ShouldBindJSON(&log); err == nil {
			// 存入 MySQL 或 Neo4j，用于后续的评价算法
			utils.Infof("%+v", log)
			utils.Infof("收到执行数据: Cell #%d, 成功: %v", log.ExecutionCount, log.Success)
			c.JSON(200, gin.H{"status": "captured"})
		}
	})

	api := ginRouter.Group("/api")
	{
		api.POST("/login")
	}

	// 需要登录态的接口
	auth := ginRouter.Group("/api")
	auth.Use(middleware.JWTAuth())
	{
		// 学生侧
		student := auth.Group("/student")
		student.Use(middleware.RequireRole(1))
		{
		}

		// 教师侧（后续补齐真实接口：班级仪表盘/预警/热力图等）
		teacher := auth.Group("/teacher")
		teacher.Use(middleware.RequireRole(2))
		{
			teacher.GET("/ping", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "teacher ok"})
			})
		}
	}

	return ginRouter
}
