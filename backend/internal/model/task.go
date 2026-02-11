package model

import (
	"database/sql"
	"time"
)

type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

type Task struct {
	ID          int          `json:"id" db:"id"`
	UserID      int          `json:"user_id" db"user_id`
	Title       string       `json:"title" db:"title"`
	Description string       `json:"description" db:"description"`
	IsCompleted bool         `json:"is_completed" db:"is_completed"`
	Priority    Priority     `json:"priority" db:"priority"`
	DueDate     sql.NullTime `json:"due_date" db:"due_date"`
	CreatedAt   time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at" db:"updated_at"`
}
