package controller

import (
	"net/http"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type LoginController struct {
	userService *service.UserService
}

func NewLoginController() *LoginController {
	return &LoginController{
		userService: service.NewUserService(config.DB),
	}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"` // student/teacher
}

func (lc *LoginController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Errorf("登录请求参数错误: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	// 1. 角色转换
	var targetRole int8 = 1 // 默认学生
	if req.Role == "teacher" {
		targetRole = 2
	}

	// 2. 查询用户
	var user *model.User
	user, err := lc.userService.GetUserByNumberAndRole(req.Username, targetRole)
	if err != nil {
		utils.Errorf("用户登录失败，账号: %s, 角色: %s, 错误: %v", req.Username, req.Role, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "账号错误"})
		return
	}

	// 3. 校验密码 (实际存储的是 hash)
	if err := utils.CheckPassword(user.Password, req.Password); err != nil {
		utils.Errorf("用户登录失败，ID: %d, 错误: %v", user.ID, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "密码错误"})
		return
	}

	// 4. 生成 Token
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		utils.Errorf("生成token失败，ID: %d, err: %v", user.ID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "登录失败"})
		return
	}

	utils.Info("用户登录成功，ID:", user.ID, "角色:", user.Role)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":              user.ID,
			"user_number":     user.UserNumber,
			"name":            user.Name,
			"role":            user.Role,
			"cognitive_level": user.CognitiveLevel,
		},
	})
}
