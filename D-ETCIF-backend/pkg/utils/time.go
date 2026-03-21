// Package utils
// D-ETCIF-backend/pkg/utils/time.go
package utils

import (
	"time"

	"D-ETCIF-backend/internal/model"
)

func NowTime() time.Time {
	return time.Now()
}

func SetUserTimestamps(users []*model.User) []*model.User {
	now := NowTime()
	for _, user := range users {
		user.CreatedAt = now
		user.UpdatedAt = now
	}
	return users
}
