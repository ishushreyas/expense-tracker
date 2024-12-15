package handlers

import (
    "context"
    "encoding/json"
    "net/http"
    "strings"
    "time"

    "github.com/google/uuid"
    "github.com/gorilla/mux"
    "github.com/ishushreyas/expense-tracker/db"
    "github.com/jackc/pgx/v5"
)

func AddUser(w http.ResponseWriter, r *http.Request) {
    type UserInput struct {
        Name string `json:"name"`
    }
    var input UserInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // Basic input validation
    input.Name = strings.TrimSpace(input.Name)
    if input.Name == "" {
        http.Error(w, "Name cannot be empty", http.StatusBadRequest)
        return
    }

    // Create context with timeout
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    userID := uuid.New().String()
    query := "INSERT INTO users (id, name, is_active) VALUES ($1, $2, true)"
    
    // Use connection from pool with context
    _, err := db.Pool.Exec(ctx, query, userID, input.Name)
    if err != nil {
        http.Error(w, "Failed to add user: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"id": userID, "name": input.Name})
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
    // Create context with timeout
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    query := "SELECT id, name, is_active FROM users"
    
    // Use connection from pool with context
    rows, err := db.Pool.Query(ctx, query)
    if err != nil {
        http.Error(w, "Failed to retrieve users: "+err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    // Use pgx.Rows parsing
    users, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])
    if err != nil {
        http.Error(w, "Failed to collect users: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Handle case of no users
    if len(users) == 0 {
        w.WriteHeader(http.StatusNoContent)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}

func GetUserByID(w http.ResponseWriter, r *http.Request) {
    // Extract the user ID from URL parameters
    vars := mux.Vars(r) // Using Gorilla Mux
    id := vars["id"]

    if id == "" {
        http.Error(w, "User ID is required", http.StatusBadRequest)
        return
    }

    // Create context with timeout
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    // Query to retrieve user by ID
    query := "SELECT id, name, is_active FROM users WHERE id = $1"

    // Execute the query
    row := db.Pool.QueryRow(ctx, query, id)

    // Parse the result into a User struct
    var user User
    err := row.Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        if err == pgx.ErrNoRows {
            http.Error(w, "User not found", http.StatusNotFound)
        } else {
            http.Error(w, "Failed to retrieve user: "+err.Error(), http.StatusInternalServerError)
        }
        return
    }

    // Respond with the user data
    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(user); err != nil {
        http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
    }
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
    // Get user ID from URL parameters
    vars := mux.Vars(r)
    userID := vars["id"]

    // Create context with timeout
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    // Execute delete query
    commandTag, err := db.Pool.Exec(ctx, "DELETE FROM users WHERE id = $1", userID)
    if err != nil {
        http.Error(w, "Failed to delete user: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Check if any rows were affected
    if commandTag.RowsAffected() == 0 {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

// Define a struct that matches the database columns
type User struct {
    ID       string `json:"id" db:"id"`
    Username     string `json:"name" db:"username"`
    Email      string	   `json:"email"`
}
