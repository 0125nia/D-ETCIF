// Package middleware
// D-ETCIF-backend/pkg/middleware/jwt.go
package middleware

import (
	"net/http"
	"strings"

	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// JWTAuth 登录校验中间件
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取请求头 Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "未提供token",
			})
			c.Abort()
			return
		}

		// 2. 校验格式 Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "token格式错误",
			})
			c.Abort()
			return
		}

		tokenStr := parts[1]

		// 3. 解析token
		claims, err := utils.ParseToken(tokenStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  "token无效或已过期",
			})
			c.Abort()
			return
		}

		// 4. 把用户信息存入 gin context，后续接口可直接获取
		c.Set("userID", claims.UserID)
		c.Set("role", claims.Role)

		// 继续执行后续接口
		c.Next()
	}
}
