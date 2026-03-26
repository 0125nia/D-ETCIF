package service

import (
	"sync"
	"time"

	"D-ETCIF-backend/internal/model"
)

// FailMap 使用 sync.Map 保证并发安全，避免多个请求同时写入
var FailMap sync.Map

// CheckAndIncrFail 增加失败计数并返回当前次数
func checkAndIncrFail(studentID string) uint32 {
	val, _ := FailMap.LoadOrStore(studentID, &model.UserStat{FailCount: 0, LastSeen: time.Now()})
	stat := val.(*model.UserStat)

	stat.FailCount++
	stat.LastSeen = time.Now()
	return stat.FailCount
}

// ResetFail 清空计数
func resetFail(studentID string) {
	FailMap.Delete(studentID)
}
