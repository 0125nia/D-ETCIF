// Package utils
// D-ETCIF-backend/pkg/utils/response.go
package utils

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// Response 统一响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    http.StatusOK,
		Message: "success",
		Data:    data,
	})
}

// Fail 失败响应
func Fail(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}

// BadRequest 400错误
func BadRequest(c *gin.Context, message string) {
	Fail(c, http.StatusBadRequest, message)
}

// Unauthorized 401错误
func Unauthorized(c *gin.Context, message string) {
	Fail(c, http.StatusUnauthorized, message)
}

// InternalServerError 500错误
func InternalServerError(c *gin.Context, message string) {
	Fail(c, http.StatusInternalServerError, message)
}
