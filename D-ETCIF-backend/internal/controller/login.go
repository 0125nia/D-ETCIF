// Package controller
// D-ETCIF-backend/internal/controller/login.go
package controller

import (
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

type LoginResponse struct {
	Token string     `json:"token"`
	User  model.User `json:"user"`
}

func (lc *LoginController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Errorf("登录请求参数错误: %v", err)
		utils.BadRequest(c, "参数错误")
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
		utils.Unauthorized(c, "账号错误")
		return
	}

	// 3. 校验密码 (实际存储的是 hash)
	if err := utils.CheckPassword(user.Password, req.Password); err != nil {
		utils.Errorf("用户登录失败，ID: %d, 错误: %v", user.ID, err)
		utils.Unauthorized(c, "密码错误")
		return
	}

	// 4. 生成 Token
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		utils.Errorf("生成token失败，ID: %d, err: %v", user.ID, err)
		utils.InternalServerError(c, "登录失败")
		return
	}

	utils.Info("用户登录成功，ID:", user.ID, "角色:", user.Role)

	loginResp := LoginResponse{
		Token: token,
		User: model.User{
			ID:         user.ID,
			UserNumber: user.UserNumber,
			Name:       user.Name,
			Role:       user.Role,
		},
	}
	utils.Success(c, loginResp)
}
