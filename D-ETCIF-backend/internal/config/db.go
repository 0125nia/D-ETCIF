// Package config
// D-ETCIF-backend/internal/config/db.go
package config

import (
	"context"
	"fmt"

	cfg "D-ETCIF-backend/configs"
	"D-ETCIF-backend/pkg/utils"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var (
	DB          *gorm.DB
	Neo4jDriver neo4j.DriverWithContext
)

// InitDB 初始化 MySQL 和 Neo4j
func InitDB() {
	// 1. MySQL 初始化 (GORM)
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local", cfg.Config.Mysql.UserName, cfg.Config.Mysql.Password, cfg.Config.Mysql.Host, cfg.Config.Mysql.Port, cfg.Config.Mysql.Database)
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		utils.Errorf("MySQL 连接失败: %v", err)
		panic(err)
	}
	utils.Info("MySQL 已连接")

	// 2. Neo4j 初始化
	uri := fmt.Sprintf("bolt://%s:%d", cfg.Config.Neo4j.Host, cfg.Config.Neo4j.Port)
	Neo4jDriver, err = neo4j.NewDriverWithContext(uri, neo4j.BasicAuth(cfg.Config.Neo4j.UserName, cfg.Config.Neo4j.Password, ""))
	if err != nil {
		utils.Errorf("Neo4j 连接失败: %v", err)
		panic(err)
	}

	// 测试连接
	ctx := context.Background()
	if err = Neo4jDriver.VerifyConnectivity(ctx); err != nil {
		utils.Errorf("Neo4j 验证失败: %v", err)
		panic(err)
	}
	utils.Info("Neo4j 已连接")
}
