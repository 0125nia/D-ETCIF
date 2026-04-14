// Package repository
// D-ETCIF-backend/internal/repository/users_migration.go
package repository

import (
	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"
)

func MigrateUsers(usersFilePath string) error {
	if usersFilePath == "" {
		utils.Info("没有用户数据文件，跳过用户数据迁移")
		return nil
	}
	if bool, _ := utils.IsCSVEmpty(usersFilePath); bool {
		utils.Info("用户数据文件为空，跳过用户数据迁移")
		return nil
	}

	userService := service.NewUserService(config.DB)

	if err := userService.CreateUsersFromCSV(usersFilePath); err != nil {
		return err
	}
	return nil
}
