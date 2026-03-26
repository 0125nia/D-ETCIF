package service

import (
	"context"

	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/ws"

	"github.com/gin-gonic/gin"
)

type FeedbackService struct{}

func NewFeedbackService() *FeedbackService {
	return &FeedbackService{}
}

func (fs *FeedbackService) RealtimeFeedback(log *model.ExecutionLog) {
	env := map[string]interface{}{
		"CellContent": log.CellContent,
		"Error":       log.Error,
		"Success":     log.Success,
	}
	alerts := checkRules(env)
	if len(alerts) > 0 {
		ws.GlobalHub.SendAlert(log.StudentID, gin.H{
			"type": "REALTIME_FEEDBACK",
			"data": alerts,
		})
	}
}

func (fs *FeedbackService) StrategyFeedback(log *model.ExecutionLog) {
	if !log.Success {
		// 1. 内存自增
		currentFails := checkAndIncrFail(log.StudentID)

		// 2. 阈值判断：如果连续错 3 次，触发二级反馈
		if currentFails >= 3 {
			ctx := context.Background()
			sug, err := buildStrategySuggestion(ctx, log)
			if err != nil {
				// 如果缺少知识点标识或 Neo4j 查询失败，给一个兜底话术（避免前端空白）。
				sug = &strategySuggestion{
					Title:       "路径建议：基础排查",
					Content:     "检测到你在当前步骤出现多次失败。建议先对照实验指导书核对：变量是否已定义、数据是否加载成功、每一步输出是否符合预期；必要时回退到上一步逐行验证。",
					CodeSnippet: "# 逐行自测（示例）\nprint('shape:', df.shape)\nprint(df.head())",
				}
			}

			// 3. WS 推送 (适配既有前端消息结构)
			ws.GlobalHub.SendAlert(log.StudentID, gin.H{
				"type": "STRATEGY_FEEDBACK",
				"data": gin.H{
					"title":        sug.Title,
					"content":      sug.Content,
					"code_snippet": sug.CodeSnippet,
				},
			})

			// 4. 推送完重置，防止刷屏
			resetFail(log.StudentID)
		}
	} else {
		// 如果运行成功了，也重置计数，表示学生已经自我修复
		resetFail(log.StudentID)
	}
}
