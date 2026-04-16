// Package service
// D-ETCIF-backend/internal/service/monitor_pipeline.go
package service

import (
	"sync"

	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"
)

type ExecutionLogHandler func(log *model.ExecutionLog)

type ExecutionLogBus struct {
	ch          chan model.ExecutionLog
	handlers    []ExecutionLogHandler
	handlersMu  sync.RWMutex
	startWorker sync.Once
}

func NewExecutionLogBus(bufferSize int) *ExecutionLogBus {
	if bufferSize <= 0 {
		bufferSize = 256
	}

	return &ExecutionLogBus{
		ch: make(chan model.ExecutionLog, bufferSize),
	}
}

func (b *ExecutionLogBus) Subscribe(handler ExecutionLogHandler) {
	if handler == nil {
		return
	}

	b.handlersMu.Lock()
	b.handlers = append(b.handlers, handler)
	b.handlersMu.Unlock()
}

func (b *ExecutionLogBus) Start() {
	b.startWorker.Do(func() {
		go func() {
			for log := range b.ch {
				b.handlersMu.RLock()
				handlers := make([]ExecutionLogHandler, len(b.handlers))
				copy(handlers, b.handlers)
				b.handlersMu.RUnlock()

				for _, handler := range handlers {
					handlerLog := log
					func() {
						defer func() {
							if r := recover(); r != nil {
								utils.Errorf("ExecutionLog 事件处理 panic: %v", r)
							}
						}()
						handler(&handlerLog)
					}()
				}
			}
		}()
	})
}

func (b *ExecutionLogBus) Publish(log *model.ExecutionLog) {
	if log == nil {
		return
	}

	select {
	case b.ch <- *log:
	default:
		utils.Infof("ExecutionLog 事件队列已满(student=%s, experiment=%s)，丢弃本次异步反馈事件", log.StudentID, log.ExperimentID)
	}
}

var GlobalExecutionLogBus = NewExecutionLogBus(256)

func InitMonitorPipeline() {
	GlobalExecutionLogBus.Start()

	GlobalExecutionLogBus.Subscribe(func(log *model.ExecutionLog) {
		PublishBehaviorEvent(&model.BehaviorEvent{
			Kind:         model.BehaviorKindExecutionLog,
			Stage:        "mid",
			Source:       "ipython",
			StudentID:    log.StudentID,
			ExperimentID: log.ExperimentID,
			OccurredAt:   log.CreatedAt,
			Payload: map[string]interface{}{
				"execution_log":   log,
				"cell_content":    log.CellContent,
				"execution_count": log.ExecutionCount,
				"success":         log.Success,
				"error":           log.Error,
			},
		})
	})
}
