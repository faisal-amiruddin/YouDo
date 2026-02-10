package main

import (
	"fmt"
	"log"

	"github.com/faisal-amiruddin/YouDo/backend/internal/config"
	"github.com/faisal-amiruddin/YouDo/backend/internal/database"
)

func main() {
	fmt.Println("Anjay Mabar")
	fmt.Println("Cihuyyy")

	cfg, err := config.Load()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.Connect(&cfg.Database)

	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}
	defer database.Close(db)
}