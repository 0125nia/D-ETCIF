// Package router
// D-ETCIF-backend/internal/router/router.go
package router

import (
	"net/http"

	"D-ETCIF-backend/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	ginRouter := gin.Default()
	ginRouter.Use(middleware.Cors())
	ginRouter.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "ok"})
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
