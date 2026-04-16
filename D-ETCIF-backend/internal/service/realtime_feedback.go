// Package service
// D-ETCIF-backend/internal/service/realtime_feedback.go
package service

import (
	"encoding/json"
	"os"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"

	"github.com/expr-lang/expr"
	"github.com/expr-lang/expr/vm"
)

type CompiledRule struct {
	Rule    model.Rule
	Program *vm.Program
}

var CompiledRules []CompiledRule

// InitEngine initializes the rule engine by loading rules from the database.
// It also seeds the database from configs/rules.json if it's empty.
func InitEngine() {
	var rules []model.Rule
	if err := config.DB.Find(&rules).Error; err != nil {
		utils.Errorf("Failed to query rules: %v", err)
		return
	}

	// If no rules exist, seed from rules.json
	if len(rules) == 0 {
		data, err := os.ReadFile("configs/rules.json")
		if err == nil {
			var seedRules []model.Rule
			if err := json.Unmarshal(data, &seedRules); err == nil {
				config.DB.Create(&seedRules)
				rules = seedRules
				utils.Info("Seeded rules from rules.json, count:", len(seedRules))
			} else {
				utils.Errorf("Failed to parse rules.json: %v", err)
			}
		} else {
			utils.Errorf("Failed to read rules.json: %v", err)
		}
	} else {
		utils.Info("Loaded rules from database, count:", len(rules))
	}

	for _, r := range rules {
		program, err := expr.Compile(r.Condition)
		if err == nil {
			CompiledRules = append(CompiledRules, CompiledRule{Rule: r, Program: program})
			utils.Info("Compiled rule:", r.Name)
		} else {
			utils.Errorf("Failed to compile rule condition '%s': %v", r.Condition, err)
		}
	}
	utils.Info("Total compiled rules:", len(CompiledRules))
}

func checkRules(env map[string]interface{}) []model.Rule {
	var triggered []model.Rule
	for _, cr := range CompiledRules {
		output, err := expr.Run(cr.Program, env)
		if err == nil && output.(bool) {
			triggered = append(triggered, cr.Rule)
		}
	}
	return triggered
}
