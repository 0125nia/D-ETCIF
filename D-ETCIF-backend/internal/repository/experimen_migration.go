// Package repository
// D-ETCIF-backend/internal/repository/experiment_migration.go
package repository

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"

	"gorm.io/gorm/clause"
)

type experimentDetailsJSON struct {
	ID           int64  `json:"id"`
	ExperimentID int64  `json:"experiment_id"`
	Name         string `json:"name"`
	Desc         string `json:"desc"`
	Difficulty   string `json:"difficulty"`
}

type experimentDataJSON struct {
	Pre   []model.PreExperimentData   `json:"pre"`
	Doing []model.DoingExperimentData `json:"doing"`
	Post  []postItemJSON              `json:"post"`
}

type postItemJSON struct {
	ID             int64    `json:"id"`
	ExperimentID   int64    `json:"experiment_id"`
	ExperimentName string   `json:"experiment_name"`
	Question       string   `json:"question"`
	Questions      string   `json:"questions"`
	Options        []string `json:"options"`
	Answer         string   `json:"answer"`
}

func MigrateExperimentDetails(detailsFilePath string) error {
	if detailsFilePath == "" {
		utils.Info("没有实验详情数据文件，跳过实验详情迁移")
		return nil
	}

	var raw []experimentDetailsJSON
	if err := readJSONFile(detailsFilePath, &raw); err != nil {
		return fmt.Errorf("读取实验详情JSON失败: %w", err)
	}
	if len(raw) == 0 {
		utils.Info("实验详情数据为空，跳过实验详情迁移")
		return nil
	}

	items := make([]model.ExperimentDetails, 0, len(raw))
	for _, item := range raw {
		experimentID := item.ExperimentID
		if experimentID == 0 {
			experimentID = item.ID
		}
		items = append(items, model.ExperimentDetails{
			ID:           item.ID,
			ExperimentID: experimentID,
			Name:         item.Name,
			Desc:         item.Desc,
			Difficulty:   parseDifficulty(item.Difficulty),
		})
	}

	if err := config.DB.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"experiment_id",
			"name",
			"desc",
			"difficulty",
		}),
	}).Create(&items).Error; err != nil {
		return fmt.Errorf("写入实验详情数据失败: %w", err)
	}

	utils.Infof("实验详情迁移完成，共 %d 条", len(items))
	return nil
}

func MigrateExperimentData(dataFilePath string) error {
	if dataFilePath == "" {
		utils.Info("没有实验数据文件，跳过实验数据迁移")
		return nil
	}

	var payload experimentDataJSON
	if err := readJSONFile(dataFilePath, &payload); err != nil {
		return fmt.Errorf("读取实验数据JSON失败: %w", err)
	}

	fallbackExperimentID, fallbackExperimentName := inferExperimentContext(payload)
	skippedPostCount := 0

	posts := make([]model.PostExperimentData, 0, len(payload.Post))
	for _, item := range payload.Post {
		question := strings.TrimSpace(item.Question)
		// if question == "" {
		//  	question = strings.TrimSpace(item.Questions)
		// }

		experimentID := item.ExperimentID
		if experimentID == 0 {
			if fallbackExperimentID == 0 {
				skippedPostCount++
				utils.Warn(fmt.Sprintf("跳过 post 实验数据(id=%d): 缺少 experiment_id", item.ID))
				continue
			}
			experimentID = fallbackExperimentID
		}
		experimentName := strings.TrimSpace(item.ExperimentName)
		if experimentName == "" {
			if strings.TrimSpace(fallbackExperimentName) == "" {
				skippedPostCount++
				utils.Warn(fmt.Sprintf("跳过 post 实验数据(id=%d): 缺少 experiment_name", item.ID))
				continue
			}
			experimentName = fallbackExperimentName
		}

		optionsJSON, _ := json.Marshal(item.Options)
		posts = append(posts, model.PostExperimentData{
			ID:             item.ID,
			ExperimentID:   experimentID,
			ExperimentName: experimentName,
			Question:       question,
			Options:        string(optionsJSON),
			Answer:         item.Answer,
		})
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		}
	}()

	if len(payload.Pre) > 0 {
		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"experiment_id",
				"experiment_name",
				"source_name",
				"source_child_name",
				"url",
				"type",
			}),
		}).Create(&payload.Pre).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("写入 pre 实验数据失败: %w", err)
		}
	}

	if len(payload.Doing) > 0 {
		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"experiment_id",
				"experiment_name",
				"topic_details",
				"answer",
			}),
		}).Create(&payload.Doing).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("写入 doing 实验数据失败: %w", err)
		}
	}

	if len(posts) > 0 {
		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"experiment_id",
				"experiment_name",
				"question",
				"options",
				"answer",
			}),
		}).Create(&posts).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("写入 post 实验数据失败: %w", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	utils.Infof("实验资源迁移完成，pre=%d，doing=%d，post=%d，post_skipped=%d", len(payload.Pre), len(payload.Doing), len(posts), skippedPostCount)
	return nil
}

// inferExperimentContext 按 pre -> doing -> post 的顺序推断实验ID与实验名。
// 当无法从任何来源推断时，返回 (0, "")。
func inferExperimentContext(payload experimentDataJSON) (int64, string) {
	var experimentID int64
	experimentName := ""

	if len(payload.Pre) > 0 {
		for _, item := range payload.Pre {
			if experimentID == 0 && item.ExperimentID != 0 {
				experimentID = item.ExperimentID
			}
			if experimentName == "" && strings.TrimSpace(item.ExperimentName) != "" {
				experimentName = strings.TrimSpace(item.ExperimentName)
			}
			if experimentID != 0 && experimentName != "" {
				return experimentID, experimentName
			}
		}
	}

	if len(payload.Doing) > 0 {
		for _, item := range payload.Doing {
			if experimentID == 0 && item.ExperimentID != 0 {
				experimentID = item.ExperimentID
			}
			if experimentName == "" && strings.TrimSpace(item.ExperimentName) != "" {
				experimentName = strings.TrimSpace(item.ExperimentName)
			}
			if experimentID != 0 && experimentName != "" {
				return experimentID, experimentName
			}
		}
	}

	for _, item := range payload.Post {
		if experimentID == 0 && item.ExperimentID != 0 {
			experimentID = item.ExperimentID
		}
		if experimentName == "" && strings.TrimSpace(item.ExperimentName) != "" {
			experimentName = strings.TrimSpace(item.ExperimentName)
		}
		if experimentID != 0 && experimentName != "" {
			return experimentID, experimentName
		}
	}

	return experimentID, experimentName
}

// userExperimentJSON 用户实验数据JSON结构
type userExperimentJSON struct {
	UserID       int64 `json:"user_id"`
	ExperimentID int64 `json:"experiment_id"`
	Stage        int   `json:"stage"`
}

// MigrateUserExperiments 从JSON文件中迁移用户实验数据
func MigrateUserExperiments(filePath string) error {
	if filePath == "" {
		utils.Info("没有用户实验数据文件，跳过用户实验数据迁移")
		return nil
	}

	var raw []userExperimentJSON
	if err := readJSONFile(filePath, &raw); err != nil {
		return fmt.Errorf("读取用户实验数据JSON失败: %w", err)
	}

	if len(raw) == 0 {
		utils.Info("用户实验数据为空，跳过用户实验数据迁移")
		return nil
	}

	// 转换为model.Experiment类型
	userExperiments := make([]model.Experiment, 0, len(raw))
	for _, item := range raw {
		userExperiments = append(userExperiments, model.Experiment{
			UserID:       item.UserID,
			ExperimentID: item.ExperimentID,
			Stage:        item.Stage,
		})
	}

	// 批量插入用户实验数据
	if len(userExperiments) > 0 {
		if err := config.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "user_id"}, {Name: "experiment_id"}},
			DoNothing: true,
		}).Create(&userExperiments).Error; err != nil {
			return fmt.Errorf("写入用户实验数据失败: %w", err)
		}
	}

	utils.Infof("用户实验数据迁移完成，共 %d 条", len(userExperiments))
	return nil
}

func readJSONFile(filePath string, target any) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}
	if err = json.Unmarshal(data, target); err != nil {
		return err
	}
	return nil
}

func parseDifficulty(raw string) int {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return 1
	}

	if val, err := strconv.Atoi(raw); err == nil && val > 0 {
		return val
	}

	switch raw {
	case "入门":
		return 1
	case "基础":
		return 2
	case "中等":
		return 3
	case "困难":
		return 4
	default:
		return 1
	}
}
