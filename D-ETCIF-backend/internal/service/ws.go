package service

import (
	"D-ETCIF-backend/pkg/ws"

	"github.com/gin-gonic/gin"
)

type WebSocketService struct{}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{}
}

func (s *WebSocketService) SendAlert(studentID string, typo string, data interface{}) {
	ws.GlobalHub.SendAlert(studentID, gin.H{
		"type": typo,
		"data": data,
	})
}
