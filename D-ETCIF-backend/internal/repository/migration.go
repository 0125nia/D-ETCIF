// Package repository
// D-ETCIF-backend/internal/repository/migration.go
package repository

import (
	cfg "D-ETCIF-backend/configs"
	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"
)

type MigrationLog struct {
	ID        uint `gorm:"primaryKey"`
	Success   bool
	CreatedAt int64
}

func Migrate() {
	if config.DB == nil {
		utils.Info("数据库未连接，跳过迁移")
		return
	}

	if config.DB.Migrator().HasTable(&MigrationLog{}) {
		utils.Info("数据库已迁移，跳过迁移")
		return
	}

	if err := AutoMigrate(); err != nil {
		utils.Errorf("数据库迁移失败: %v", err)
		logMigration(false)
		return
	}

	utils.Info("数据库迁移完成，开始迁移数据")

	if err := MigrateWithData(); err != nil {
		utils.Errorf("数据迁移失败: %v", err)
		logMigration(false)
		return
	}

	utils.Info("数据迁移完成")
	logMigration(true)
}

func AutoMigrate() error {
	// 自动迁移
	err := config.DB.AutoMigrate(
		&model.User{},
		&model.PreEvent{},
		&model.MidEvent{},
		&model.PostEvent{},
		&model.Rule{},
	)
	return err
}

func MigrateWithData() error {
	// 迁移用户数据
	err := MigrateUsers(cfg.Config.Migrate.UserDataPath)
	return err
}

func logMigration(success bool) {
	config.DB.AutoMigrate(&MigrationLog{})
	migrationLog := MigrationLog{
		Success:   success,
		CreatedAt: utils.NowTime().Unix(),
	}
	config.DB.Create(&migrationLog)
}
