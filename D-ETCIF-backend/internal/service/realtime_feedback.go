// Package service
// D-ETCIF-backend/internal/service/realtime_feedback.go
package service

import (
	"D-ETCIF-backend/internal/model"

	"github.com/expr-lang/expr"
	"github.com/expr-lang/expr/vm"
)

type CompiledRule struct {
	Rule    model.Rule
	Program *vm.Program
}

var CompiledRules []CompiledRule

func init() {
	initEngine()
}

func initEngine() {
	SecurityRules := []model.Rule{
		{
			Name:      "Dangerous Commands",
			Condition: "CellContent matches '(?i)rm -rf|os.system|subprocess.call'",
			Message:   "🚨 检测到高危系统指令！实验环境下禁止执行删除或底层系统调用。",
			Severity:  "error",
		},
		{
			Name:      "Infinite Loop Risk",
			Condition: "CellContent matches 'while True' && !(CellContent matches 'break')",
			Message:   "⚠️ 警告：检测到不含 break 的 while True 循环，可能导致内核卡死。",
			Severity:  "warning",
		},
	}

	SyntaxRules := []model.Rule{
		{
			Name:      "Indentation Error",
			Condition: "Error contains 'IndentationError'",
			Message:   "💡 提示：Python 对缩进非常敏感，请检查冒号后的代码块是否正确缩进。",
			Severity:  "info",
		},
		{
			Name:      "Name Error",
			Condition: "Error contains 'is not defined'",
			Message:   "🔍 变量未定义：请确保你已经运行了定义该变量的 Cell，或者检查单词拼写。",
			Severity:  "info",
		},
	}

	allRules := append(SecurityRules, SyntaxRules...)
	for _, r := range allRules {
		program, err := expr.Compile(r.Condition)
		if err == nil {
			CompiledRules = append(CompiledRules, CompiledRule{Rule: r, Program: program})
		}
	}
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
