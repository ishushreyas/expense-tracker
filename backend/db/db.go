// db/db.go
package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func InitDatabase() (*pgxpool.Pool, error) {
	// Read database connection URL from environment or use default
	if os.Getenv("RENDER_SERVICE_ID") == "" { // (Render sets RENDER_SERVICE_ID in production)
		err := godotenv.Load()
		if err != nil {
			log.Println("env not found in RENDER development")
		}
	}
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Panic("error getting db url")	
	}

	// Create connection pool
	var err error
	Pool, err = pgxpool.New(context.Background(), connStr)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %v", err)
	}

	// Verify connection
	conn, err := Pool.Acquire(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to acquire connection: %v", err)
	}
	defer conn.Release()

	if err := conn.Conn().Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	log.Println("Successfully connected to database")
	return Pool, nil
}

func CloseDatabase() {
	if Pool != nil {
		Pool.Close()
	}
}
