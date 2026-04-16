// Package main
// D-ETCIF-backend/cmd/main.go
package main

import (
	config "D-ETCIF-backend/configs"
	"D-ETCIF-backend/internal/repository"
	"D-ETCIF-backend/internal/router"
	"D-ETCIF-backend/pkg/utils"

	db_config "D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"
)

func main() {
	utils.Info("========开始初始化数据库连接========")

	db_config.InitDB()

	repository.Migrate()

	utils.Info("========数据库连接初始化完成========")

	utils.Info("========初始化规则引擎========")
	service.InitEngine()

	utils.Info("========初始化监控事件管线========")
	service.InitMonitorPipeline()

	utils.Info("========初始化反馈事件管线========")
	service.InitFeedbackPipeline()

	r := router.NewRouter()

	utils.Info("========启动服务========")
	defer utils.Info("========服务已停止========")
	_ = r.Run(config.Config.Server.Port)
}
