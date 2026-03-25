// Package ws
// D-ETCIF-backend/pkg/ws/hub.go
package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	// key 为 studentId，value 为对应的 WS 连接
	Clients sync.Map
}

var GlobalHub = &Hub{}

func (h *Hub) Register(studentID string, conn *websocket.Conn) {
	h.Clients.Store(studentID, conn)
}

func (h *Hub) Unregister(studentID string) {
	h.Clients.Delete(studentID)
}

func (h *Hub) SendAlert(studentID string, payload interface{}) {
	if conn, ok := h.Clients.Load(studentID); ok {
		wsConn := conn.(*websocket.Conn)
		wsConn.WriteJSON(payload)
	}
}
