// Package model
// D-ETCIF-backend/internal/model/profile.go
package model

// CognitiveMapNode 对应前端认知图谱节点
type CognitiveMapNode struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Expid int    `json:"expid"` // 对应前端 expid
	Type  string `json:"type"`  // 对应前端 Student/KnowledgePoint
}

// CognitiveMapLink 对应前端认知图谱边
type CognitiveMapLink struct {
	Source string  `json:"source"`
	Target string  `json:"target"`
	Value  float64 `json:"value"`
}

// CognitiveMapData 包装
type CognitiveMapData struct {
	Nodes []CognitiveMapNode `json:"nodes"`
	Links []CognitiveMapLink `json:"links"`
}

// StudyReportData 学习报告
type StudyReportData struct {
	TotalTime    int     `json:"total_time"`
	TotalExp     int     `json:"total_exp"`
	ErrorRate    float64 `json:"error_rate"`
	AverageScore float64 `json:"average_score"`
}

// ResourceRecommendation 推荐资源（方案B新增）
type ResourceRecommendation struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Link string `json:"link"`
}
