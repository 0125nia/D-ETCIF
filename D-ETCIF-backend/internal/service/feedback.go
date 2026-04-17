// Package service
// D-ETCIF-backend/internal/service/feedback.go
package service

import (
	"context"
	"fmt"
	"strings"

	"D-ETCIF-backend/internal/config"
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"
	"D-ETCIF-backend/pkg/ws"
)

type FeedbackService struct {
	recordService *FeedbackRecordService
}

func NewFeedbackService() *FeedbackService {
	return &FeedbackService{
		recordService: NewFeedbackRecordService(config.DB),
	}
}

func (fs *FeedbackService) HandleBehaviorEvent(event *model.BehaviorEvent) {
	if event == nil {
		return
	}

	utils.Info("Handling behavior event:", event.Kind, "action:", event.ActionType)

	switch event.Kind {
	case model.BehaviorKindExecutionLog:
		utils.Info("Handling ExecutionLog event")
		log, ok := event.Payload["execution_log"].(*model.ExecutionLog)
		if !ok || log == nil {
			utils.Info("ExecutionLog payload missing, skip feedback dispatch")
			return
		}
		if log.StudentID == "" {
			log.StudentID = event.StudentID
		}
		if log.ExperimentID == "" {
			log.ExperimentID = event.ExperimentID
		}
		utils.Info("Found execution_log in payload")
		fs.RealtimeFeedback(log, event)
		fs.StrategyFeedback(log, event)
	case model.BehaviorKindMidEvent:
		utils.Info("Handling MidEvent event")
		cellContent := stringifyPayload(event.Payload["content"])
		if strings.TrimSpace(cellContent) == "" {
			utils.Info("No cell content in MidEvent")
			return
		}

		errorText := stringifyPayload(event.Payload["error"])
		successRaw, hasSuccess := event.Payload["success"]
		if !hasSuccess && strings.TrimSpace(errorText) == "" {
			utils.Info("MidEvent has no execution result, skip feedback dispatch")
			return
		}

		success := false
		if hasSuccess {
			success = boolFromPayload(successRaw)
		}

		log := &model.ExecutionLog{
			StudentID:    event.StudentID,
			ExperimentID: event.ExperimentID,
			CellContent:  cellContent,
			Error:        errorText,
			Success:      success,
		}
		utils.Info("Created execution log from MidEvent")
		fs.RealtimeFeedback(log, event)
		fs.StrategyFeedback(log, event)
	case model.BehaviorKindSummarySubmit:
		utils.Info("Handling SummarySubmit event")
		fs.SummaryFeedback(event.StudentID, event.ExperimentID, event)
	case model.BehaviorKindPostEvent:
		utils.Info("Handling PostEvent event, action:", event.ActionType)
		if shouldTriggerSummaryByPostAction(event.ActionType) {
			utils.Info("Triggering SummaryFeedback for PostEvent")
			fs.SummaryFeedback(event.StudentID, event.ExperimentID, event)
		} else {
			utils.Info("Not triggering SummaryFeedback for PostEvent action:", event.ActionType)
		}
	case model.BehaviorKindReportUpload:
		utils.Info("Handling ReportUpload event")
		fs.SummaryFeedback(event.StudentID, event.ExperimentID, event)
	default:
		utils.Info("Unknown event kind:", event.Kind)
	}
}

func shouldTriggerSummaryByPostAction(actionType string) bool {
	actionType = strings.ToLower(strings.TrimSpace(actionType))
	switch actionType {
	case "report_submit", "summary_submit", "exam_submit", "test_submit", "post_finish", "post_quiz_submit", "post_reflection_submit", "post_report_submit":
		return true
	default:
		return false
	}
}

func stringifyPayload(value interface{}) string {
	switch typed := value.(type) {
	case string:
		return typed
	default:
		return ""
	}
}

func boolFromPayload(value interface{}) bool {
	switch typed := value.(type) {
	case bool:
		return typed
	case string:
		return strings.EqualFold(strings.TrimSpace(typed), "true")
	default:
		return false
	}
}

func (fs *FeedbackService) RealtimeFeedback(log *model.ExecutionLog, event *model.BehaviorEvent) {
	utils.Info("Starting RealtimeFeedback")
	env := map[string]interface{}{
		"CellContent": log.CellContent,
		"Error":       log.Error,
		"Success":     log.Success,
	}
	utils.Info("Checking rules with env:", env)
	alerts := checkRules(env)
	utils.Info("Rules checked, found alerts:", len(alerts))
	commonAlerts := detectCommonRealtimeErrors(log)
	utils.Info("Common errors detected:", len(commonAlerts))
	alerts = append(alerts, commonAlerts...)
	alerts = dedupeRules(alerts)
	utils.Info("After deduping, alerts:", len(alerts))
	if len(alerts) > 0 {
		utils.Info("Found alerts, creating feedback records")
		wsAlerts := make([]model.Rule, 0, len(alerts))
		for _, alert := range alerts {
			utils.Info("Creating feedback record for alert:", alert.Name)
			record := &model.FeedbackRecord{
				StudentID:      log.StudentID,
				ExperimentID:   log.ExperimentID,
				FeedbackType:   "即时提醒",
				Title:          alert.Name,
				Content:        fmt.Sprintf("%s: %s", alert.Name, alert.Message),
				Severity:       normalizeSeverity(alert.Severity),
				WSFeedbackType: model.WSFeedbackTypeRealtime,
				Level:          model.FeedbackLevelRealtime,
				Display:        model.FeedbackDisplayDoingPanel,
				Stage:          safeEventStage(event),
				EventKind:      safeEventKind(event),
				ActionType:     safeEventAction(event),
			}
			if err := fs.recordService.Create(record); err != nil {
				utils.Errorf("反馈入库失败(Realtime): %v", err)
				continue
			}
			wsAlerts = append(wsAlerts, alert)
		}

		if len(wsAlerts) == 0 {
			utils.Info("No wsAlerts to send")
			return
		}

		utils.Info("Sending realtime feedback via WebSocket")
		ws.GlobalHub.SendAlert(log.StudentID, buildFeedbackEnvelope(
			model.WSFeedbackTypeRealtime,
			model.FeedbackLevelRealtime,
			model.FeedbackDisplayDoingPanel,
			event,
			wsAlerts,
		))
	} else {
		utils.Info("No alerts found for realtime feedback")
	}
}

func (fs *FeedbackService) StrategyFeedback(log *model.ExecutionLog, event *model.BehaviorEvent) {
	utils.Info("Starting StrategyFeedback, success:", log.Success)
	if !log.Success {
		// 1. 内存自增
		currentFails := checkAndIncrFail(log.StudentID, log.ExperimentID)
		utils.Info("Current failure count:", currentFails)

		// 2. 阈值判断：如果连续错 3 次，触发二级反馈
		if currentFails >= 3 {
			utils.Info("Failure count >= 3, triggering strategy feedback")
			var sug *strategySuggestion
			if quick := buildQuickSuggestionForCommonErrors(log); quick != nil {
				utils.Info("Found quick suggestion for common errors")
				sug = quick
			} else {
				utils.Info("Building strategy suggestion from Neo4j")
				ctx := context.Background()
				var err error
				sug, err = buildStrategySuggestion(ctx, log)
				if err != nil {
					// 如果缺少知识点标识或 Neo4j 查询失败，给一个兜底话术（避免前端空白）。
					utils.Info("Error building strategy suggestion:", err)
					sug = &strategySuggestion{
						Title:         "路径建议：基础排查",
						Content:       "检测到你在当前步骤出现多次失败。建议先对照实验指导书核对：变量是否已定义、数据是否加载成功、每一步输出是否符合预期；必要时回退到上一步逐行验证。",
						CodeSnippet:   "# 逐行自测（示例）\nprint('shape:', df.shape)\nprint(df.head())",
						KnowledgeLink: "/student/profile",
					}
				}
			}

			utils.Info("Creating strategy feedback record")
			if err := fs.recordService.Create(&model.FeedbackRecord{
				StudentID:      log.StudentID,
				ExperimentID:   log.ExperimentID,
				FeedbackType:   "思路引导",
				Title:          sug.Title,
				Content:        sug.Content,
				Severity:       "warning",
				CodeSnippet:    sug.CodeSnippet,
				KnowledgeLink:  sug.KnowledgeLink,
				WSFeedbackType: model.WSFeedbackTypeStrategy,
				Level:          model.FeedbackLevelStrategy,
				Display:        model.FeedbackDisplayFeedbackPage,
				Stage:          safeEventStage(event),
				EventKind:      safeEventKind(event),
				ActionType:     safeEventAction(event),
			}); err != nil {
				utils.Errorf("反馈入库失败(Strategy): %v", err)
				return
			}

			// 3. WS 推送 (适配既有前端消息结构)
			utils.Info("Sending strategy feedback via WebSocket")
			ws.GlobalHub.SendAlert(log.StudentID, buildFeedbackEnvelope(
				model.WSFeedbackTypeStrategy,
				model.FeedbackLevelStrategy,
				model.FeedbackDisplayFeedbackPage,
				event,
				map[string]interface{}{
					"title":          sug.Title,
					"content":        sug.Content,
					"code_snippet":   sug.CodeSnippet,
					"knowledge_link": sug.KnowledgeLink,
				},
			))

			// 4. 推送完重置，防止刷屏
			utils.Info("Resetting failure count")
			resetFail(log.StudentID, log.ExperimentID)
		}
	} else {
		// 如果运行成功了，也重置计数，表示学生已经自我修复
		utils.Info("Code execution successful, resetting failure count")
		resetFail(log.StudentID, log.ExperimentID)
	}
}

func (fs *FeedbackService) SummaryFeedback(studentID string, experimentID string, event *model.BehaviorEvent) {
	ctx := context.Background()

	// 查询置信度低于 0.6 的薄弱点，最多返回 5 个
	weakPoints, err := QueryWeakPointsAndResources(ctx, studentID, 0.6, 5)
	if err != nil {
		utils.Errorf("QueryWeakPointsAndResources error: %v", err)
		weakPoints = []WeakPointResource{}
	}

	content := "实验已结束，系统为你生成了本次实验的薄弱点总结及推荐资源。"
	if err := fs.recordService.Create(&model.FeedbackRecord{
		StudentID:      studentID,
		ExperimentID:   experimentID,
		FeedbackType:   "长期补救",
		Title:          "实验总结：薄弱点与资源推荐",
		Content:        content,
		Severity:       "success",
		WSFeedbackType: model.WSFeedbackTypeSummary,
		Level:          model.FeedbackLevelSummary,
		Display:        model.FeedbackDisplayProfilePage,
		Stage:          safeEventStage(event),
		EventKind:      safeEventKind(event),
		ActionType:     safeEventAction(event),
	}); err != nil {
		utils.Errorf("反馈入库失败(Summary): %v", err)
		return
	}

	// 构造推送内容
	ws.GlobalHub.SendAlert(studentID, buildFeedbackEnvelope(
		model.WSFeedbackTypeSummary,
		model.FeedbackLevelSummary,
		model.FeedbackDisplayProfilePage,
		event,
		map[string]interface{}{
			"experiment_id": experimentID,
			"weak_points":   weakPoints,
			"message":       content,
		},
	))
}

func normalizeSeverity(value string) string {
	v := strings.ToLower(strings.TrimSpace(value))
	switch v {
	case "warning", "error", "success":
		return v
	case "info":
		return "success"
	default:
		return "warning"
	}
}

func safeEventStage(event *model.BehaviorEvent) string {
	if event == nil {
		return ""
	}
	return event.Stage
}

func safeEventKind(event *model.BehaviorEvent) string {
	if event == nil {
		return ""
	}
	return event.Kind
}

func safeEventAction(event *model.BehaviorEvent) string {
	if event == nil {
		return ""
	}
	return event.ActionType
}

func detectCommonRealtimeErrors(log *model.ExecutionLog) []model.Rule {
	if log == nil {
		return nil
	}

	cell := strings.ToLower(strings.TrimSpace(log.CellContent))
	errMsg := strings.ToLower(strings.TrimSpace(log.Error))

	out := make([]model.Rule, 0, 2)

	// 典型拼写错误：import panda -> 应为 pandas
	if strings.Contains(cell, "import panda") ||
		strings.Contains(cell, "from panda import") ||
		strings.Contains(errMsg, "no module named 'panda'") ||
		strings.Contains(errMsg, "no module named \"panda\"") {
		out = append(out, model.Rule{
			Name:     "导入库拼写错误（pandas）",
			Message:  "检测到你可能把 pandas 写成了 panda。请改为 import pandas as pd，并重新运行该单元。",
			Severity: "warning",
		})
	}

	return out
}

func buildQuickSuggestionForCommonErrors(log *model.ExecutionLog) *strategySuggestion {
	if log == nil {
		return nil
	}

	cell := strings.ToLower(strings.TrimSpace(log.CellContent))
	errMsg := strings.ToLower(strings.TrimSpace(log.Error))

	if strings.Contains(cell, "import panda") ||
		strings.Contains(cell, "from panda import") ||
		strings.Contains(errMsg, "no module named 'panda'") ||
		strings.Contains(errMsg, "no module named \"panda\"") {
		return &strategySuggestion{
			Title: "路径建议：先补 pandas 导入与基础用法",
			Content: "你在当前实验中连续 3 次出现同类导入错误，系统判定你卡在“Python 可视化库导入”知识点。" +
				"建议先学习对应资源后再继续实验：Python 常见数据可视化库、pandas 基础导入与 DataFrame 读写。",
			CodeSnippet:   "# 正确写法\nimport pandas as pd\n\n# 读取数据示例\ndf = pd.read_excel('data.xlsx')\nprint(df.head())",
			KnowledgeLink: "/knowledge/python-visualization-libraries",
		}
	}

	return nil
}

func dedupeRules(rules []model.Rule) []model.Rule {
	if len(rules) == 0 {
		return rules
	}

	seen := make(map[string]struct{}, len(rules))
	out := make([]model.Rule, 0, len(rules))
	for _, r := range rules {
		key := strings.TrimSpace(r.Name) + "|" + strings.TrimSpace(r.Message)
		if key == "|" {
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, r)
	}
	return out
}
