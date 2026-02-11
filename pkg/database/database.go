package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/faisal-amiruddin/YouDo/pkg/config"
	_ "github.com/lib/pq"
)

func Connect(cfg *config.DatabaseConfig) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host,
		cfg.Port,
		cfg.User,
		cfg.Password,
		cfg.DBName,
		cfg.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)

	if err != nil {
		return nil, fmt.Errorf("Error opening database %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(10 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("Error connecting to database %w", err)
	}

	log.Println("Database connected!")
	return db, nil
}

func Close(db *sql.DB) error {
	if db != nil {
		log.Println("Closing database connection...")
		return db.Close()
	}

	return nil
}