package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/ishushreyas/expense-tracker/db"
)

type TransactionType string

const (
	TransactionTypeSend    TransactionType = "SEND"
	TransactionTypeReceive TransactionType = "RECEIVE"
)

type ExtendedTransaction struct {
	Transaction
	Type       TransactionType `json:"type"`
	SenderName string          `json:"sender_name"`
	Status     string          `json:"status"`
}

type WebSocketServer struct {
	clients     map[*websocket.Conn]bool
	broadcast   chan ExtendedTransaction
	register    chan *websocket.Conn
	unregister  chan *websocket.Conn
	repository  *db.TransactionRepository
}

func NewWebSocketServer(repo *db.TransactionRepository) *WebSocketServer {
	return &WebSocketServer{
		clients:     make(map[*websocket.Conn]bool),
		broadcast:   make(chan ExtendedTransaction),
		register:    make(chan *websocket.Conn),
		unregister:  make(chan *websocket.Conn),
		repository:  repo,
	}
}

func (s *WebSocketServer) Run() {
	for {
		select {
		case client := <-s.register:
			s.clients[client] = true
		case client := <-s.unregister:
			if _, ok := s.clients[client]; ok {
				delete(s.clients, client)
				client.Close()
			}
		case transaction := <-s.broadcast:
			for client := range s.clients {
				err := client.WriteJSON(transaction)
				if err != nil {
					client.Close()
					delete(s.clients, client)
				}
			}
		}
	}
}

func (s *WebSocketServer) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	s.register <- conn

	for {
		var transaction *db.Transaction
		err := conn.ReadJSON(&transaction)
		if err != nil {
			s.unregister <- conn
			break
		}

		transaction.ID = uuid.New()
		transaction.CreatedAt = time.Now()

		err = s.repository.CreateTransaction(&transaction)
		if err != nil {
			log.Printf("Error saving transaction: %v", err)
			continue
		}

		extendedTxn := ExtendedTransaction{
			Transaction: transaction,
			Type:        TransactionTypeSend,
			Status:      "PENDING",
		}
		s.broadcast <- extendedTxn
	}
}

type TransactionController struct {
	repository *db.TransactionRepository
	wsServer   *WebSocketServer
}

func NewTransactionController(repo *db.TransactionRepository, ws *WebSocketServer) *TransactionController {
	return &TransactionController{
		repository: repo,
		wsServer:   ws,
	}
}

func (c *TransactionController) Routes() {
	http.HandleFunc("/ws/transactions", c.wsServer.HandleWebSocket)
}
