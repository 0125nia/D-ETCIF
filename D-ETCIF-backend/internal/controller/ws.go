// Package controller
// D-ETCIF-backend/internal/controller/ws.go
package controller

import (
	"net/http"

	"D-ETCIF-backend/pkg/utils"
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
	if studentID == "" || studentID == "0" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的studentId参数"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		utils.Errorf("WebSocket 升级失败: %v", err)
		return
	}

	ws.GlobalHub.Register(studentID, conn)
	defer ws.GlobalHub.Unregister(studentID)

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			utils.Infof("WebSocket 连接关闭(student=%s): %v", studentID, err)
			break
		}
	}
}
