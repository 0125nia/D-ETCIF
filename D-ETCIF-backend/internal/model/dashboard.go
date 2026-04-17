// Package model
// D-ETCIF-backend/internal/model/dashboard.go
package model

// HeatmapItem 知识点掌握热力图项
type HeatmapItem struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Value float64 `json:"value"` // 掌握度百分比
	Group string  `json:"group"` // 章节/分组名称
}

// BehaviorData 班级行为分析雷达图
type BehaviorData struct {
	Dimensions []string  `json:"dimensions"`
	Values     []float64 `json:"values"`
}

// LowConfidenceStudent 低置信度学生预警
type LowConfidenceStudent struct {
	Name    string  `json:"name"`
	Subject string  `json:"subject"`
	Score   float64 `json:"score"`
}

// HighFreqError 高频错误点预警
type HighFreqError struct {
	Title string `json:"title"`
	Rate  int    `json:"rate"`
}

// WarningData 预警系统聚合数据
type WarningData struct {
	LowConfidence      []LowConfidenceStudent `json:"lowConfidence"`
	HighFrequencyError []HighFreqError        `json:"highFrequencyError"`
}
