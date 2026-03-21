// Package model
// D-ETCIF-backend/internal/model/user.go
package model

import "time"

// User 用户 role 1:学生 2:教师
type User struct {
	ID         int64  `gorm:"primaryKey;autoIncrement:false" json:"id"`
	UserNumber string `gorm:"type:varchar(100);uniqueIndex;not null" json:"user_number"`
	Name       string `gorm:"type:varchar(100);not null" json:"name"`

	Password string `gorm:"type:varchar(255);not null" json:"-"` // 存储 hash

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Role      int8      `json:"role"`

	// 综合认知水平（0-100分制或1-5级），由后台算法定期从 Neo4j 同步回来
	CognitiveLevel float32 `gorm:"default:0" json:"cognitive_level"`
}
