package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/ishushreyas/expense-tracker/db"
	"github.com/ishushreyas/expense-tracker/handlers"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"google.golang.org/api/option"
)

// Initialize Firebase app
func initFirebase() (*auth.Client, error) {
	opt := option.WithCredentialsFile("/etc/secrets/serviceAccountKey.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing Firebase app: %v", err)
	}
	return app.Auth(context.Background())
}

// Extract ID token from the request body
func getIDTokenFromBody(r *http.Request) (string, error) {
	var data map[string]string
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		return "", err
	}
	token, exists := data["idToken"]
	if !exists {
		return "", fmt.Errorf("idToken not found in request body")
	}
	return token, nil
}

// Helper function to get logged-in user information from context
func getLoggedInUser(r *http.Request) (*auth.Token, error) {
	user := r.Context().Value("user")
	if user == nil {
		return nil, fmt.Errorf("user not found in context")
	}
	return user.(*auth.Token), nil
}

// Create a session for authenticated users
func createSessionHandler(client *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		idToken, err := getIDTokenFromBody(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		decodedToken, err := client.VerifyIDToken(r.Context(), idToken)
		if err != nil {
			http.Error(w, "Invalid ID token", http.StatusUnauthorized)
			return
		}

		if time.Now().Unix()- int64(decodedToken.Claims["auth_time"].(float64)) > 5*60 {
			http.Error(w, "Recent sign-in required", http.StatusUnauthorized)
			return
		}

		expiresIn := time.Hour * 24 * 5
		sessionCookie, err := client.SessionCookie(r.Context(), idToken, expiresIn)
		if err != nil {
			http.Error(w, "Failed to create session cookie", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session",
			Value:    sessionCookie,
			MaxAge:   int(expiresIn.Seconds()),
			HttpOnly: true,
			Secure:   true,
		})
		w.Write([]byte(`{"status": "success"}`))
	}
}

// Middleware to verify session cookies
// Middleware to verify session cookies and attach user information to the context
func verifySessionMiddleware(client *auth.Client, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil || cookie == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Verify session cookie and check for revocation
		decodedToken, err := client.VerifySessionCookieAndCheckRevoked(r.Context(), cookie.Value)
		if err != nil {
			http.Error(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		// Add user info to the request context
		ctx := context.WithValue(r.Context(), "user", decodedToken)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func main() {
	client, err := initFirebase()
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	// Initialize database
	dbPool, err := db.InitDatabase()
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.CloseDatabase()

	// Initialize repositories and controllers
	transactionRepo := db.NewTransactionRepository(dbPool)
	wsServer := handlers.NewWebSocketServer(transactionRepo)
	transactionController := handlers.NewTransactionController(transactionRepo, wsServer)

	// Start WebSocket server
	go wsServer.Run()

	// Define routes
	transactionController.Routes()

	r := mux.NewRouter()
	r.HandleFunc("/sessionLogin", createSessionHandler(client)).Methods("POST")
	r.HandleFunc("/profile", verifySessionMiddleware(client, func(w http.ResponseWriter, r *http.Request) {
	user, err := getLoggedInUser(r)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Example: Send back user information
	response := map[string]interface{}{
		"uid":   user.UID,
		"email": user.Claims["email"], // Assuming email claim is set in Firebase
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
})).Methods("GET")
	r.HandleFunc("/users", handlers.AddUser).Methods("POST")
	r.HandleFunc("/users", handlers.GetUsers).Methods("GET")
	r.HandleFunc("/users/{id}", handlers.GetUserByID).Methods("GET")
	r.HandleFunc("/users/{id}", handlers.DeleteUser).Methods("DELETE")
	r.HandleFunc("/transactions", handlers.GetTransactions).Methods("GET")
	r.HandleFunc("/transactions/{id}", handlers.GetTransactionByID).Methods("GET")
	r.HandleFunc("/transactions", verifySessionMiddleware(client, handlers.AddTransaction)).Methods("POST")
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
