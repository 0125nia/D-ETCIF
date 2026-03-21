// Package middleware
// D-ETCIF-backend/pkg/middleware/role.go
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole 角色鉴权中间件
// - 仅有 JWTAuth 只能确认“已登录”，但无法防止学生访问教师资源（越权）
// 教师端接口通常具备更高敏感度（班级整体数据、预警等）
//
// role：1=student, 2=teacher（与 model.User.Role 保持一致）
func RequireRole(role int8) gin.HandlerFunc {
	return func(c *gin.Context) {
		v, ok := c.Get("role")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
			c.Abort()
			return
		}
		r, ok := v.(int8)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "登录态异常"})
			c.Abort()
			return
		}
		if r != role {
			c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
			c.Abort()
			return
		}
		c.Next()
	}
}
