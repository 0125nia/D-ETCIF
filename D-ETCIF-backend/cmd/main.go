// Package cmd D-ETCIF-backend/cmd/main.go
package main

import (
	config "D-ETCIF-backend/configs"
	"D-ETCIF-backend/internal/router"
	"D-ETCIF-backend/pkg/utils"

	db_config "D-ETCIF-backend/internal/config"
)

func main() {
	utils.Info("========开始初始化数据库连接========")

	db_config.InitDB()

	utils.Info("========数据库连接初始化完成========")
	r := router.NewRouter()

	utils.Info("========启动服务========")
	defer utils.Info("========服务已停止========")
	_ = r.Run(config.Config.Server.Port)
}
