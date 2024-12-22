package handlers

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "sort"
    "strconv"
    "time"

    "github.com/google/uuid"
    "github.com/gorilla/mux"
    "github.com/ishushreyas/expense-tracker/db"
    "github.com/jackc/pgx/v5"
)

type Transaction struct {
    ID         uuid.UUID   `json:"id" db:"id"`
    PayerID    uuid.UUID   `json:"payer_id" db:"payer_id"`
    Amount     float64     `json:"amount" db:"amount"`
    Members    []uuid.UUID `json:"members" db:"members"`
    Remark     string      `json:"remark" db:"remark"`
    CreatedAt time.Time   `json:"created_at" db:"created_at"`
    IsDeleted  bool        `json:"is_deleted" db:"is_deleted"`
    DeletedAt  *time.Time  `json:"deleted_at,omitempty" db:"deleted_at"`
}

func AddTransaction(w http.ResponseWriter, r *http.Request) {
    type TransactionInput struct {
        PayerID string   `json:"payer_id"`
        Amount  float64  `json:"amount"`
        Members []string `json:"members"`
        Remark  string   `json:"remark"`
    }

    var input TransactionInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // Convert members strings to uuid.UUID
    var membersUUID []uuid.UUID
    for _, member := range input.Members {
        memberUUID, err := uuid.Parse(member)
        if err != nil {
            http.Error(w, "Invalid member UUID", http.StatusBadRequest)
            return
        }
        membersUUID = append(membersUUID, memberUUID)
    }

    // Create transaction and insert into DB
    transactionID := uuid.New().String()
    query := "INSERT INTO transactions (id, payer_id, amount, members, created_at, remark) VALUES ($1, $2, $3, $4, now(), $5)"

    _, err := db.Pool.Exec(r.Context(), query, transactionID, input.PayerID, input.Amount, membersUUID, input.Remark)
    if err != nil {
        http.Error(w, "Failed to add transaction: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"id": transactionID})
}

func GetTransactions(w http.ResponseWriter, r *http.Request) {
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
    SELECT id, payer_id, amount, members, created_at, remark, is_deleted, deleted_at
    FROM transactions
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
		http.Error(w, "Failed to retrieve transactions: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Collect rows
	transactions, err := pgx.CollectRows(rows, pgx.RowToStructByName[Transaction])
	if err != nil {
		http.Error(w, "Failed to process transactions: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle empty result
	if len(transactions) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Prepare response with pagination info
	response := map[string]interface{}{
		"transactions": transactions,
		"page":         page,
		"limit":        limit,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetTransactionByID(w http.ResponseWriter, r *http.Request) {
    // Create context with timeout
    ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
    defer cancel()

    // Get transaction ID from URL parameters
    vars := mux.Vars(r)
    transactionIDStr := vars["id"]
    transactionID, err := uuid.Parse(transactionIDStr)
    if err != nil {
        http.Error(w, "Invalid transaction ID format", http.StatusBadRequest)
        return
    }

    // Prepare query
    query := `
    SELECT id, payer_id, amount, members, created_at, remark, is_deleted, deleted_at
    FROM transactions
    WHERE id = $1
    `

    // Execute query
    var transaction Transaction
    err = db.Pool.QueryRow(ctx, query, transactionID).Scan(
        &transaction.ID,
        &transaction.PayerID,
        &transaction.Amount,
        &transaction.Members,
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
func DeleteTransaction(w http.ResponseWriter, r *http.Request) {
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
		DELETE FROM transactions
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
		"message": "Transaction deleted successfully",
		"id":      deletedID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func SoftDeleteTransaction(w http.ResponseWriter, r *http.Request) {
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
		UPDATE transactions
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
func GenerateSummary(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters for date range
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	// Create context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Build query with date filtering if provided
	sqlQuery := `
		WITH daily_stats AS (
			SELECT
				DATE(created_at) as date,
				COUNT(*) as daily_count,
				SUM(amount) as daily_total,
				MAX(amount) as max_transaction
			FROM transactions
			WHERE is_deleted = false
			AND ($1 = '' OR created_at >= $1::timestamp)
			AND ($2 = '' OR created_at <= $2::timestamp)
			GROUP BY DATE(created_at)
		)
		SELECT
			t.id,
			t.payer_id,
			t.amount,
			t.members,
			t.created_at,
			t.remark,
			t.is_deleted,
			t.deleted_at,
			u.username,
			u.email
		FROM transactions t
		LEFT JOIN users u ON t.payer_id = u.id
		WHERE t.is_deleted = false
		AND ($1 = '' OR t.created_at >= $1::timestamp)
		AND ($2 = '' OR t.created_at <= $2::timestamp)
	`

	// Execute query
	rows, err := db.Pool.Query(ctx, sqlQuery, startDate, endDate)
	if err != nil {
		http.Error(w, "Failed to retrieve transactions: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Data structures for aggregation
	type TransactionWithMeta struct {
		Transaction
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	var transactions []TransactionWithMeta
	userMap := make(map[uuid.UUID]struct {
		Username string
		Email    string
	})

	// Collect and process rows
	for rows.Next() {
		var t TransactionWithMeta
		err := rows.Scan(
			&t.ID,
			&t.PayerID,
			&t.Amount,
			&t.Members,
			&t.CreatedAt,
			&t.Remark,
			&t.IsDeleted,
			&t.DeletedAt,
			&t.Username,
			&t.Email,
		)
		if err != nil {
			http.Error(w, "Failed to scan row: "+err.Error(), http.StatusInternalServerError)
			return
		}
		transactions = append(transactions, t)
		userMap[t.PayerID] = struct {
			Username string
			Email    string
		}{t.Username, t.Email}
	}

	// Calculate various metrics
	var (
		totalExpense     float64
		categoryExpenses = make(map[string]float64)
		userExpenses    = make(map[uuid.UUID]float64)
		userBalances    = make(map[uuid.UUID]float64)
		dailyStats      = make(map[string]struct {
			Count     int
			Total     float64
			MaxAmount float64
		})
		transactionCount = len(transactions)
	)

	// Process transactions
	for _, t := range transactions {
		totalExpense += t.Amount

		// Category expenses
		if t.Category != "" {
			categoryExpenses[t.Category] += t.Amount
		}

		// User expenses
		userExpenses[t.PayerID] += t.Amount

		// Calculate balances
		memberCount := float64(len(t.Members))
		if memberCount > 0 {
			share := t.Amount / memberCount
			for _, member := range t.Members {
				userBalances[member] -= share
			}
			userBalances[t.PayerID] += t.Amount
		}

		// Daily statistics
		dateKey := t.CreatedAt.Format("2006-01-02")
		daily := dailyStats[dateKey]
		daily.Count++
		daily.Total += t.Amount
		if t.Amount > daily.MaxAmount {
			daily.MaxAmount = t.Amount
		}
		dailyStats[dateKey] = daily
	}

	// Calculate additional metrics
	var (
		avgTransactionAmount float64
		maxTransactionAmount float64
		activeUserCount     = len(userExpenses)
	)

	if transactionCount > 0 {
		avgTransactionAmount = totalExpense / float64(transactionCount)
	}

	for _, t := range transactions {
		if t.Amount > maxTransactionAmount {
			maxTransactionAmount = t.Amount
		}
	}

	// Prepare users array
	users := make([]map[string]interface{}, 0, len(userMap))
	for id, user := range userMap {
		users = append(users, map[string]interface{}{
			"id":       id,
			"username": user.Username,
			"email":    user.Email,
		})
	}

	// Calculate expense trends
	var dailyTrends []map[string]interface{}
	for date, stats := range dailyStats {
		dailyTrends = append(dailyTrends, map[string]interface{}{
			"date":          date,
			"total":         stats.Total,
			"count":         stats.Count,
			"max_amount":    stats.MaxAmount,
			"avg_amount":    stats.Total / float64(stats.Count),
		})
	}

	// Sort daily trends by date
	sort.Slice(dailyTrends, func(i, j int) bool {
		return dailyTrends[i]["date"].(string) < dailyTrends[j]["date"].(string)
	})

	// Prepare response
	response := map[string]interface{}{
		"total_expenses":        totalExpense,
		"transaction_count":     transactionCount,
		"average_transaction":   avgTransactionAmount,
		"largest_transaction":   maxTransactionAmount,
		"active_users":         activeUserCount,
		"category_expenses":     categoryExpenses,
		"user_expenses":        userExpenses,
		"user_balances":        userBalances,
		"daily_trends":         dailyTrends,
		"users":                users,
		"period": map[string]string{
			"start_date": startDate,
			"end_date":   endDate,
		},
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func EditTransaction(w http.ResponseWriter, r *http.Request) {
    type TransactionInput struct {
	ID      uuid.UUID `json:"id"`
        PayerID string    `json:"payer_id"`
        Amount  float64   `json:"amount"`
        Members []string  `json:"members"`
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
        SET payer_id = $1, amount = $2, members = $3, remark = $4
        WHERE id = $5`
    _, err = db.Pool.Exec(r.Context(), query, updatedTransaction.PayerID, updatedTransaction.Amount, updatedTransaction.Members, updatedTransaction.Remark, transactionID)
    if err != nil {
        http.Error(w, fmt.Sprintf("Failed to update transaction: %v", err), http.StatusInternalServerError)
        return
    }

    // Respond with the updated transaction
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(updatedTransaction)
}
