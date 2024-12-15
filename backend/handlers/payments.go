package handlers

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "strconv"
    "time"

    "github.com/google/uuid"
    "github.com/gorilla/mux"
    "github.com/ishushreyas/expense-tracker/db"
    "github.com/jackc/pgx/v5"
)

type Payment struct {
    ID         uuid.UUID   `json:"id" db:"id"`
    PayerID    uuid.UUID   `json:"payer_id" db:"payer_id"`
    Amount     float64     `json:"amount" db:"amount"`
    RecieverID uuid.UUID `json:"members" db:"reciever_id"`
    Remark     string      `json:"remark" db:"remark"`
    CreatedAt  time.Time   `json:"created_at" db:"created_at"`
    IsDeleted  bool        `json:"is_deleted" db:"is_deleted"`
    DeletedAt  *time.Time  `json:"deleted_at,omitempty" db:"deleted_at"`
}

func AddPayment(w http.ResponseWriter, r *http.Request) {
    type TransactionInput struct {
        PayerID string   `json:"payer_id"`
        Amount  float64  `json:"amount"`
        RecieverID string   `json:"reciever_id"`
        Remark  string   `json:"remark"`
    }

    var input TransactionInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // Convert members strings to uuid.UUID
    recieverUUID, err := uuid.Parse(input.RecieverID)

    // Create transaction and insert into DB
    transactionID := uuid.New().String()
    query := "INSERT INTO transactions (id, payer_id, amount, reciever_id, created_at, remark) VALUES ($1, $2, $3, $4, now(), $5)"

    _, err = db.Pool.Exec(r.Context(), query, transactionID, input.PayerID, input.Amount, recieverUUID, input.Remark)
    if err != nil {
        http.Error(w, "Failed to add transaction: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"id": transactionID})
}

func GetPayments(w http.ResponseWriter, r *http.Request) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Parse query parameters
	query := r.URL.Query()
	
	// Default pagination
	page := 1
	limit := 20
	
	if pageStr := query.Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	if limitStr := query.Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Build base query with flexible filtering
	sqlQuery := `
    SELECT id, payer_id, amount, reciever_id, created_at, remark, is_deleted, deleted_at
    FROM payments
    WHERE is_deleted = false
`
	
	// Optional filters
	var args []interface{}
	argCount := 1

	// Filter by payer ID if provided
	if payerID := query.Get("payer_id"); payerID != "" {
		sqlQuery += " AND payer_id = $" + strconv.Itoa(argCount)
		args = append(args, payerID)
		argCount++
	}

	// Filter by date range if provided
	if startDate := query.Get("start_date"); startDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", startDate); err == nil {
			sqlQuery += " AND timestamp >= $" + strconv.Itoa(argCount)
			args = append(args, parsedDate)
			argCount++
		}
	}

	if endDate := query.Get("end_date"); endDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", endDate); err == nil {
			sqlQuery += " AND timestamp <= $" + strconv.Itoa(argCount)
			args = append(args, parsedDate)
			argCount++
		}
	}

	// Add pagination
	sqlQuery += " ORDER BY timestamp DESC LIMIT $" + strconv.Itoa(argCount) + 
				" OFFSET $" + strconv.Itoa(argCount+1)
	args = append(args, limit, offset)

	// Execute query
	rows, err := db.Pool.Query(ctx, sqlQuery, args...)
	if err != nil {
		http.Error(w, "Failed to retrieve payments: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Collect rows
	transactions, err := pgx.CollectRows(rows, pgx.RowToStructByName[Transaction])
	if err != nil {
		http.Error(w, "Failed to process payments: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle empty result
	if len(transactions) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Prepare response with pagination info
	response := map[string]interface{}{
		"payments": transactions,
		"page":         page,
		"limit":        limit,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetPaymentByID(w http.ResponseWriter, r *http.Request) {
    // Create context with timeout
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    // Get transaction ID from URL parameters
    vars := mux.Vars(r)
    transactionIDStr := vars["id"]
    transactionID, err := uuid.Parse(transactionIDStr)
    if err != nil {
        http.Error(w, "Invalid payment ID format", http.StatusBadRequest)
        return
    }

    // Prepare query
    query := `
    SELECT id, payer_id, amount, reciever_id, created_at, remark, is_deleted, deleted_at
    FROM payments
    WHERE id = $1
    `

    // Execute query
    var transaction Payment
    err = db.Pool.QueryRow(ctx, query, transactionID).Scan(
        &transaction.ID,
        &transaction.PayerID,
        &transaction.Amount,
        &transaction.RecieverID,
        &transaction.CreatedAt,
        &transaction.Remark,
    )

    if err == pgx.ErrNoRows {
        http.Error(w, "Transaction not found", http.StatusNotFound)
        return
    } else if err != nil {
        http.Error(w, "Failed to retrieve transaction: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(transaction)
}
func DeletePayment(w http.ResponseWriter, r *http.Request) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Get transaction ID from URL parameters
	vars := mux.Vars(r)
	transactionID := vars["id"]

	// Validate transaction ID
	if transactionID == "" {
		http.Error(w, "Transaction ID is required", http.StatusBadRequest)
		return
	}

	// Prepare delete query
	query := `
		DELETE FROM payments
		WHERE id = $1
		RETURNING id
	`

	// Execute delete operation
	var deletedID string
	err := db.Pool.QueryRow(ctx, query, transactionID).Scan(&deletedID)

	if err == pgx.ErrNoRows {
		// No transaction found with given ID
		http.Error(w, "Transaction not found", http.StatusNotFound)
		return
	} else if err != nil {
		// Other database error
		http.Error(w, "Failed to delete transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := map[string]string{
		"message": "Payment deleted successfully",
		"id":      deletedID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func SoftDeletePayment(w http.ResponseWriter, r *http.Request) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Get transaction ID from URL parameters
	vars := mux.Vars(r)
	transactionID := vars["id"]

	// Validate transaction ID
	if transactionID == "" {
		http.Error(w, "Transaction ID is required", http.StatusBadRequest)
		return
	}

	// Prepare soft delete query
	query := `
		UPDATE payments
		SET is_deleted = true,
		    deleted_at = NOW()
		WHERE id = $1 AND is_deleted = false
		RETURNING id
	`

	// Execute soft delete operation
	var deletedID string
	err := db.Pool.QueryRow(ctx, query, transactionID).Scan(&deletedID)

	if err == pgx.ErrNoRows {
		// No transaction found or already deleted
		http.Error(w, "Transaction not found or already deleted", http.StatusNotFound)
		return
	} else if err != nil {
		// Other database error
		http.Error(w, "Failed to soft delete transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := map[string]string{
		"message": "Transaction soft deleted successfully",
		"id":      deletedID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// calculateBalances calculates the net balance for each member.
func GeneratePaymentSummary(w http.ResponseWriter, r *http.Request) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	sqlQuery := `
    SELECT id, payer_id, amount, reciever_id, created_at, remark, is_deleted, deleted_at
    FROM payments
    WHERE is_deleted = false
`
	// Execute query
	rows, err := db.Pool.Query(ctx, sqlQuery)
	if err != nil {
		http.Error(w, "Failed to retrieve transactions: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Collect rows
	expenses, err := pgx.CollectRows(rows, pgx.RowToStructByName[Payment])
	if err != nil {
		http.Error(w, "Failed to process transactions: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle empty result
	if len(expenses) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	balances := make(map[uuid.UUID]float64)
	user_expense := make(map[uuid.UUID]float64)
	totalExpense := 0.00

	for _, expense := range expenses {
		user_expense[expense.PayerID] += expense.Amount
		// Calculate each member's share
		share := expense.Amount / 2
		totalExpense += expense.Amount

		// Deduct shares from members and add the full amount to the payer
		balances[expense.RecieverID] += share
		balances[expense.PayerID] -= share
	}

	// Prepare response with pagination info
	response := map[string]interface{}{
		"total_expenses": totalExpense,
		"user_expenses":  user_expense,
		"user_balances":      balances,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func EditPayment(w http.ResponseWriter, r *http.Request) {
    type TransactionInput struct {
	ID      uuid.UUID `json:"id"`
        PayerID string    `json:"payer_id"`
        Amount  float64   `json:"amount"`
        RecieverID string `json:"reciever_id"`
        Remark  string    `json:"remark"`
    }

    // Get transaction ID from URL
    vars := mux.Vars(r)
    transactionIDStr := vars["id"]
    transactionID, err := uuid.Parse(transactionIDStr)
    if err != nil {
        http.Error(w, "Invalid transaction ID format", http.StatusBadRequest)
        return
    }

    // Parse the request body to get updated transaction data
    var updatedTransaction TransactionInput
    err = json.NewDecoder(r.Body).Decode(&updatedTransaction)
    if err != nil {
        http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
        return
    }

    // Make sure the transaction ID in the URL matches the one in the payload
    if updatedTransaction.ID != transactionID {
        http.Error(w, "Transaction ID mismatch", http.StatusBadRequest)
        return
    }

    // Update the transaction in the database
    query := `
        UPDATE transactions
        SET payer_id = $1, amount = $2, reciever_id = $3, remark = $4
        WHERE id = $5`
    _, err = db.Pool.Exec(r.Context(), query, updatedTransaction.PayerID, updatedTransaction.Amount, updatedTransaction.RecieverID, updatedTransaction.Remark, transactionID)
    if err != nil {
        http.Error(w, fmt.Sprintf("Failed to update transaction: %v", err), http.StatusInternalServerError)
        return
    }

    // Respond with the updated transaction
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(updatedTransaction)
}
