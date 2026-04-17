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

	// 暂时注释掉检查，强制重新迁移
	// if config.DB.Migrator().HasTable(&MigrationLog{}) {
	// 	utils.Info("数据库已迁移，跳过迁移")
	// 	return
	// }

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
		&model.ExecutionLog{},
		&model.FeedbackRecord{},
		&model.Rule{},
		&model.Experiment{},
		&model.ExperimentDetails{},
		&model.ExperimentReport{},
		&model.ExperimentSummary{},
		&model.OperationResult{},
		&model.PreExperimentData{},
		&model.PostExperimentData{},
		&model.DoingExperimentData{},
	)
	return err
}

func MigrateWithData() error {
	var errors []error

	// 迁移用户数据
	if err := MigrateUsers(cfg.Config.Migrate.UserDataPath); err != nil {
		utils.Errorf("迁移用户数据失败: %v", err)
		errors = append(errors, err)
	}

	// 迁移实验详情数据
	if err := MigrateExperimentDetails(cfg.Config.Migrate.ExperimentDetailsDataPath); err != nil {
		utils.Errorf("迁移实验详情数据失败: %v", err)
		errors = append(errors, err)
	}

	// 迁移实验数据
	if err := MigrateExperimentData(cfg.Config.Migrate.ExperimentDataPath); err != nil {
		utils.Errorf("迁移实验数据失败: %v", err)
		errors = append(errors, err)
	}

	// // 迁移用户实验数据
	// if err := MigrateUserExperiments(cfg.Config.Migrate.ExperimentStagesPath); err != nil {
	// 	utils.Errorf("迁移用户实验数据失败: %v", err)
	// 	errors = append(errors, err)
	// }

	// // 迁移教师端结果与仪表盘初始化数据
	// if err := MigrateTeacherEndpointData(); err != nil {
	// 	utils.Errorf("迁移教师端初始化数据失败: %v", err)
	// 	errors = append(errors, err)
	// }

	// // 迁移学生profile数据
	// if err := MigrateProfileData(); err != nil {
	// 	utils.Errorf("迁移学生profile数据失败: %v", err)
	// 	errors = append(errors, err)
	// }

	// 如果有错误，返回第一个错误
	if len(errors) > 0 {
		return errors[0]
	}

	return nil
}

func logMigration(success bool) {
	config.DB.AutoMigrate(&MigrationLog{})
	migrationLog := MigrationLog{
		Success:   success,
		CreatedAt: utils.NowTime().Unix(),
	}
	config.DB.Create(&migrationLog)
}
