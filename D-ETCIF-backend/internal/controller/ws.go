package controller

import (
	"net/http"

	"D-ETCIF-backend/pkg/ws"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketController struct{}

func NewWebSocketController() *WebSocketController {
	return &WebSocketController{}
}

func (wsc *WebSocketController) HandleWebSocket(c *gin.Context) {
	upgrader := websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

	studentID := c.Param("studentId")
	conn, _ := upgrader.Upgrade(c.Writer, c.Request, nil)
	ws.GlobalHub.Register(studentID, conn)
	// 保持连接（简单示例，实际需处理心跳和断开情况）
	defer ws.GlobalHub.Unregister(studentID)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}
