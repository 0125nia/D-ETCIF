// Package model
// D-ETCIF-backend/internal/model/tracker.go
package model

import "time"

type UserStat struct {
	FailCount uint32
	LastSeen  time.Time
}
