// Package ws
// D-ETCIF-backend/pkg/ws/hub.go
package ws

import (
	"sync"

	"D-ETCIF-backend/pkg/utils"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn      *websocket.Conn
	send      chan interface{}
	closeOnce sync.Once
	mu        sync.Mutex
	closed    bool
}

func newClient(conn *websocket.Conn) *Client {
	return &Client{
		conn: conn,
		send: make(chan interface{}, 32),
	}
}

func (c *Client) enqueue(payload interface{}) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.closed {
		return false
	}

	select {
	case c.send <- payload:
		return true
	default:
		return false
	}
}

func (c *Client) close() {
	c.closeOnce.Do(func() {
		c.mu.Lock()
		if !c.closed {
			c.closed = true
			close(c.send)
		}
		c.mu.Unlock()
		_ = c.conn.Close()
	})
}

type Hub struct {
	// key 为 studentId，value 为对应的 WS 客户端
	Clients sync.Map
}

var GlobalHub = &Hub{}

func (h *Hub) Register(studentID string, conn *websocket.Conn) {
	client := newClient(conn)

	if old, loaded := h.Clients.LoadOrStore(studentID, client); loaded {
		h.Clients.Store(studentID, client)
		old.(*Client).close()
	}

	go h.writePump(studentID, client)
}

func (h *Hub) writePump(studentID string, client *Client) {
	defer func() {
		if current, ok := h.Clients.Load(studentID); ok && current == client {
			h.Clients.Delete(studentID)
		}
		client.close()
	}()

	for payload := range client.send {
		if err := client.conn.WriteJSON(payload); err != nil {
			utils.Errorf("WebSocket 发送失败(student=%s): %v", studentID, err)
			return
		}
	}
}

func (h *Hub) Unregister(studentID string) {
	if client, ok := h.Clients.LoadAndDelete(studentID); ok {
		client.(*Client).close()
	}
}

func (h *Hub) SendAlert(studentID string, payload interface{}) {
	clientValue, ok := h.Clients.Load(studentID)
	if !ok {
		return
	}

	client := clientValue.(*Client)
	if !client.enqueue(payload) {
		utils.Infof("WebSocket 客户端发送队列已满(student=%s)，主动断开", studentID)
		h.Unregister(studentID)
	}
}
