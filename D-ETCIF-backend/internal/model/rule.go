package model

type Rule struct {
    Name      string `gorm:"type:varchar(50);not null" json:"name"`      // 规则名称
    Condition string `gorm:"type:varchar(255)" json:"condition"` // expr 表达式
    Message   string `gorm:"type:varchar(255)" json:"message"`   // 触发后给学生的提示
    Severity  string `gorm:"type:varchar(50)" json:"severity"`  // 严重程度：warning, error, info
}