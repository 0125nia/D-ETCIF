// Package model
// D-ETCIF-backend/internal/model/neo4j.go
package model

import "time"

//  ExperimentNode 实验主表
type ExperimentNode struct {
    ExpID   string `json:"id"`
    ExpName string `json:"name"`
}
// KnowledgePoint 知识点
type KnowledgePoint struct {
	KPID       string `gorm:"primaryKey;column:kp_id" json:"kpId"`
	KPName     string `gorm:"column:kp_name" json:"kpName"`
	Category   string `json:"category"`
	Difficulty string `json:"difficulty"`
}

// CourseResource 课程资源
type CourseResource struct {
	ResID           string `gorm:"primaryKey;column:res_id" json:"resId"`
	SourceName      string `json:"sourceName"`
	SourceChildName string `json:"sourceChildName"`
}

// ExperimentTask 实验任务/题目
type ExperimentTask struct {
	TaskID       string `gorm:"primaryKey;column:task_id" json:"taskId"`
	TaskName     string `json:"taskName"`
	TopicDetails string `gorm:"type:text" json:"topicDetails"`
	Stage        string `json:"stage"`
}

// ExamQuestion 考核题目
type ExamQuestion struct {
	QID      string `gorm:"primaryKey;column:q_id" json:"qId"`
	Question string `gorm:"type:text" json:"question"`
	Options  string `json:"options"` // 建议存储为分号分隔或JSON字符串
	Answer   string `json:"answer"`
	Type     string `json:"type"`  // single_choice, fill_blank...
	Stage    string `json:"stage"`
}



// Student 学生基本信息 (MySQL 主表)
type Student struct {
	UID      string `gorm:"primaryKey;column:uid" json:"uid"` 
	Name     string `json:"name"`
	ClassID  string `json:"classId"`
	CreateAt time.Time
}

// StudentKPState 学生对知识点的掌握状态 (MySQL 统计表 + Neo4j LEARNED 关系属性)
type StudentKPState struct {
	UID        string  `gorm:"primaryKey;column:uid" json:"uid"`
	KPID       string  `gorm:"primaryKey;column:kp_id" json:"kpId"`
	Mastery    float64 `json:"mastery"`    // 0.0 - 1.0 (通过推荐算法或规则引擎计算)
	LastUpdate time.Time `json:"lastUpdate"`
}

// StudentTaskRecord 学生完成任务的流水记录 (MySQL 流水表 + Neo4j COMPLETED 关系属性)
type StudentTaskRecord struct {
	RecordID   int64     `gorm:"primaryKey;autoIncrement" json:"recordId"`
	UID        string    `json:"uid"`
	TaskID     string    `json:"taskId"` // 引用你 JSON 里的 TASK0101 等
	Score      float64   `json:"score"`
	Feedback   string    `json:"feedback"` // 系统给出的智能反馈
	FinishTime time.Time `json:"finishTime"`
}