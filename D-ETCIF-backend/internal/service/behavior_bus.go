// Package service
// D-ETCIF-backend/internal/service/behavior_bus.go
package service

import (
	"sync"

	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"
)

type BehaviorEventHandler func(event *model.BehaviorEvent)

type BehaviorEventBus struct {
	ch          chan model.BehaviorEvent
	handlers    []BehaviorEventHandler
	handlersMu  sync.RWMutex
	startWorker sync.Once
}

func NewBehaviorEventBus(bufferSize int) *BehaviorEventBus {
	if bufferSize <= 0 {
		bufferSize = 256
	}

	return &BehaviorEventBus{
		ch: make(chan model.BehaviorEvent, bufferSize),
	}
}

func (b *BehaviorEventBus) Subscribe(handler BehaviorEventHandler) {
	if handler == nil {
		return
	}

	b.handlersMu.Lock()
	b.handlers = append(b.handlers, handler)
	b.handlersMu.Unlock()
}

func (b *BehaviorEventBus) Start() {
	b.startWorker.Do(func() {
		go func() {
			for event := range b.ch {
				b.handlersMu.RLock()
				handlers := make([]BehaviorEventHandler, len(b.handlers))
				copy(handlers, b.handlers)
				b.handlersMu.RUnlock()

				for _, handler := range handlers {
					handlerEvent := event
					func() {
						defer func() {
							if r := recover(); r != nil {
								utils.Errorf("BehaviorEvent 事件处理 panic: %v", r)
							}
						}()
						handler(&handlerEvent)
					}()
				}
			}
		}()
	})
}

func (b *BehaviorEventBus) Publish(event *model.BehaviorEvent) {
	if event == nil {
		return
	}

	select {
	case b.ch <- *event:
	default:
		utils.Infof("BehaviorEvent 事件队列已满(student=%s, experiment=%s, kind=%s)，丢弃本次异步反馈事件", event.StudentID, event.ExperimentID, event.Kind)
	}
}

var GlobalBehaviorEventBus = NewBehaviorEventBus(256)

func InitFeedbackPipeline() {
	utils.Info("Initializing feedback pipeline...")
	GlobalBehaviorEventBus.Start()
	utils.Info("Behavior event bus started")

	feedback := NewFeedbackService()
	utils.Info("Feedback service created")
	GlobalBehaviorEventBus.Subscribe(func(event *model.BehaviorEvent) {
		utils.Info("Received behavior event:", event.Kind, "from student:", event.StudentID, "experiment:", event.ExperimentID)
		feedback.HandleBehaviorEvent(event)
	})
	utils.Info("Feedback service subscribed to behavior events")
}
