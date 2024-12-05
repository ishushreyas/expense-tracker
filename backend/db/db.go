// db/db.go
package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func InitDatabase() error {
	// Read database connection URL from environment or use default
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgresql://neondb_owner:KUSF3kZJl5tQ@ep-little-wave-a1c7wacg.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
	}

	// Create connection pool
	var err error
	Pool, err = pgxpool.New(context.Background(), connStr)
	if err != nil {
		return fmt.Errorf("unable to create connection pool: %v", err)
	}

	// Verify connection
	conn, err := Pool.Acquire(context.Background())
	if err != nil {
		return fmt.Errorf("failed to acquire connection: %v", err)
	}
	defer conn.Release()

	if err := conn.Conn().Ping(context.Background()); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	log.Println("Successfully connected to database")
	return nil
}

func CloseDatabase() {
	if Pool != nil {
		Pool.Close()
	}
}
