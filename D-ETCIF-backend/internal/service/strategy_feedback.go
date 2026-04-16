// Package service
// D-ETCIF-backend/internal/service/strategy_feedback.go
package service

import (
	"sync"
	"time"
)

type failCounter struct {
	mu        sync.Mutex
	FailCount uint32
	LastSeen  time.Time
}

func makeFailKey(studentID, experimentID string) string {
	return studentID + "|" + experimentID
}

// FailMap 使用 studentID+experimentID 作为键，避免跨实验串扰
var FailMap sync.Map

// CheckAndIncrFail 增加失败计数并返回当前次数
func checkAndIncrFail(studentID, experimentID string) uint32 {
	key := makeFailKey(studentID, experimentID)
	val, _ := FailMap.LoadOrStore(key, &failCounter{FailCount: 0, LastSeen: time.Now()})
	stat := val.(*failCounter)

	stat.mu.Lock()
	defer stat.mu.Unlock()

	stat.FailCount++
	stat.LastSeen = time.Now()
	return stat.FailCount
}

// ResetFail 清空计数
func resetFail(studentID, experimentID string) {
	FailMap.Delete(makeFailKey(studentID, experimentID))
}
