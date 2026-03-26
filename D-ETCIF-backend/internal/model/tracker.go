package model

import "time"

type UserStat struct {
	FailCount uint32
	LastSeen  time.Time
}
