package main

import (
    "log"
    "fmt"
    "strings"
    "net/http"
    "io/ioutil"
    "os"
    "github.com/dgrijalva/jwt-go"
    "github.com/gorilla/mux"
    "github.com/ishushreyas/expense-tracker/db"
    "github.com/ishushreyas/expense-tracker/handlers"
    "github.com/joho/godotenv"
    "encoding/json"
    "time"
    "regexp"
    "math/rand"
)

var users = make(map[string]string) // Map for storing user email and OTP

var jwtSecret []byte
var emailStr string

func init() {
	if os.Getenv("RENDER_SERVICE_ID") == "" { // (Render sets RENDER_SERVICE_ID in production)
		err := godotenv.Load()
		if err != nil {
			log.Println("env not found in RENDER development")
		}
	}
	emailStr = os.Getenv("EMAIL_SERVICE")
	if emailStr == "" {
		log.Panic("error getting email key")	
	}
	jwtStr := os.Getenv("JWT_KEY")
	if jwtStr == "" {
		log.Panic("error getting jwt key")	
	}
	jwtSecret = []byte(jwtStr)
}

func sendOTPHandler(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Email string `json:"email"`
	}
	var reqt Request
	json.NewDecoder(r.Body).Decode(&reqt)

	// Validate email format
	if !isValidEmail(reqt.Email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	otp := generateOTP() // Generate a random OTP
	users[reqt.Email] = otp
	url := "https://sandbox.api.mailtrap.io/api/send/3159350"
	method := "POST"

	emailContent := fmt.Sprintf(`{
		"from": {"email": "hello@demomailtrap.com", "name": "Expense Tracker"},
		"to": [{"email": "%s"}],
		"subject": "Your OTP Code",
		"text": "Your OTP code is: %s",
		"category": "OTP Verification"
	}`, reqt.Email, otp)

	payload := strings.NewReader(emailContent)
	
	client := &http.Client {
	}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		fmt.Println(err)
		return
	}
	req.Header.Add("Authorization", "Bearer " +  emailStr)
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(body))
}

func verifyOTPHandler(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	var req Request
	json.NewDecoder(r.Body).Decode(&req)

	if storedOTP, ok := users[req.Email]; !ok || storedOTP != req.OTP {
		http.Error(w, "Invalid OTP", http.StatusUnauthorized)
		return
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": req.Email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}
	w.Write([]byte(tokenString))
}

// Utility function to generate a random OTP
func generateOTP() string {
	rand.Seed(time.Now().UnixNano())
	otp := fmt.Sprintf("%06d", rand.Intn(1000000))
	return otp
}

// Utility function to validate email format
func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

func verifyToken(r *http.Request) (*jwt.Token, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil, fmt.Errorf("no token found")
	}

	// Extract token from the Authorization header
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the algorithm
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signing method")
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid or expired token")
	}

	return token, nil
}

func checkLoginStatusHandler(w http.ResponseWriter, r *http.Request) {
	_, err := verifyToken(r)
	if err != nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}
	w.Write([]byte("User is logged in"))
}

func main() {
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

	r.HandleFunc("/send-otp", sendOTPHandler).Methods("POST")
	r.HandleFunc("/verify-otp", verifyOTPHandler).Methods("POST")

	r.HandleFunc("/check-login", checkLoginStatusHandler).Methods("GET")

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
