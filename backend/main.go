package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/ishushreyas/expense-tracker/db"
	"github.com/ishushreyas/expense-tracker/handlers"
)

func main() {
	// Initialize database
	database, err := db.InitDatabase()
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.CloseDatabase()

	// Initialize repositories and controllers
	transactionRepo := db.NewTransactionRepository(database)
	wsServer := handler.NewWebSocketServer(transactionRepo)
	transactionController := handler.NewTransactionController(transactionRepo, wsServer)

	r := mux.NewRouter()

	r.HandleFunc("/users", handlers.AddUser).Methods("POST")
	r.HandleFunc("/users", handlers.GetUsers).Methods("GET")
	r.HandleFunc("/users/{id}", handlers.GetUserByID).Methods("GET")
	r.HandleFunc("/users/{id}", handlers.DeleteUser).Methods("DELETE")
	r.HandleFunc("/transactions", handlers.GetTransactions).Methods("GET")
	r.HandleFunc("/transactions/{id}", handlers.GetTransactionByID).Methods("GET")
	r.HandleFunc("/transactions", handlers.AddTransaction).Methods("POST")
	r.HandleFunc("/transactions/{id}", handlers.DeleteTransaction).Methods("DELETE")
	r.HandleFunc("/transactions/{id}/soft-delete", handlers.SoftDeleteTransaction).Methods("DELETE")
	r.HandleFunc("/summary", handlers.GenerateSummary).Methods("GET")
	r.HandleFunc("/payments", handlers.GetPayments).Methods("GET")
	r.HandleFunc("/payments/{id}", handlers.GetPaymentByID).Methods("GET")
	r.HandleFunc("/payments", handlers.AddPayment).Methods("POST")
	r.HandleFunc("/payments/{id}", handlers.DeletePayment).Methods("DELETE")
	r.HandleFunc("/payments/{id}/soft-delete", handlers.SoftDeletePayment).Methods("DELETE")
	r.HandleFunc("/payment-summary", handlers.GeneratePaymentSummary).Methods("GET")

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
