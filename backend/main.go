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
	if err := db.InitDatabase(); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.CloseDatabase()

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

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
