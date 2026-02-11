package dto

import "time"

type CreateTaskRequest struct {
	Title       string  `json:"title" binding:"required,min=1,max=255"`
	Description string  `json:"description"`
	Priority    string  `json:"priority" binding:"omitempty,oneof=low medium high"`
	DueDate     *string `json:"due_date"`
}

type UpdateTaskRequest struct {
	Title       *string  `json:"title" binding:"required,min=1,max=255"`
	Description *string  `json:"description"`
	IsCompleted *bool   `json:"is_completed"`
	Priority    *string  `json:"priority" binding:"omitempty,oneof=low medium high"`
	DueDate     *string `json:"due_date"`
}

type TaskResponse struct {
	ID          int    `json:"id"`
	UserID      int    `json:"user_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	IsCompleted bool   `json:"is_completed"`
	Priority    string `json:"priority"`
	DueDate     *time.Time `json:"due_date,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TaskListResponse struct {
	Tasks []TaskResponse `json:"tasks"`
	Total int `json:"total"`
}