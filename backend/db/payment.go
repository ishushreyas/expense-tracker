package db

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Transaction struct {
	ID         uuid.UUID   `json:"id" db:"id"`
	PayerID    uuid.UUID   `json:"payer_id" db:"payer_id"`
	Amount     float64     `json:"amount" db:"amount"`
	Members    []uuid.UUID `json:"members" db:"members"`
	Remark     string      `json:"remark" db:"remark"`
	CreatedAt  time.Time   `json:"created_at" db:"created_at"`
	IsDeleted  bool        `json:"is_deleted" db:"is_deleted"`
	DeletedAt  *time.Time  `json:"deleted_at,omitempty" db:"deleted_at"`
}

type TransactionRepository struct {
	db *pgxpool.Pool
}

func NewTransactionRepository(db *pgxpool.Pool) *TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) CreateTransaction(txn *Transaction) error {
	query := `
		INSERT INTO transactions 
		(id, payer_id, amount, members, remark, created_at) 
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Exec(
		context.Background(),
		query,
		txn.ID,
		txn.PayerID,
		txn.Amount,
		txn.Members,
		txn.Remark,
		txn.CreatedAt,
	)
	return err
}
