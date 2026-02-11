package repository

import (
	"database/sql"
	"fmt"

	"github.com/faisal-amiruddin/YouDo/internal/model"
)

type TaskRepository struct {
	db *sql.DB
}

func NewTaskRepository(db *sql.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(task *model.Task) error {
	query := `
		INSERT INTO tasks (user_id, title, description, priority, due_date)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, is_completed, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		task.UserID,
		task.Title,
		task.Description,
		task.Priority,
		task.DueDate,
	).Scan(&task.ID, &task.IsCompleted, &task.CreatedAt, &task.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create task: %w", err)
	}

	return nil
}

func (r *TaskRepository) GetByID(id int, userID int) (*model.Task, error) {
	task := &model.Task{}
	query := `
		SELECT id, user_id, title, description, is_completed, priority, due_date, created_at, updated_at
		FROM tasks
		WHERE id = $1 AND user_id = $2
	`

	err := r.db.QueryRow(query, id, userID).Scan(
		&task.ID,
		&task.UserID,
		&task.Title,
		&task.Description,
		&task.IsCompleted,
		&task.Priority,
		&task.DueDate,
		&task.CreatedAt,
		&task.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("task not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get task: %w", err)
	}

	return task, nil
}

func (r *TaskRepository) GetAllByUserID(userID int) ([]model.Task, error) {
	query := `
		SELECT id, user_id, title, description, is_completed, priority, due_date, created_at, updated_at
		FROM tasks
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tasks: %w", err)
	}
	defer rows.Close()

	tasks := []model.Task{}
	for rows.Next() {
		var task model.Task
		err := rows.Scan(
			&task.ID,
			&task.UserID,
			&task.Title,
			&task.Description,
			&task.IsCompleted,
			&task.Priority,
			&task.DueDate,
			&task.CreatedAt,
			&task.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

func (r *TaskRepository) Update(task *model.Task) error {
	query := `
		UPDATE tasks
		SET title = $1, description = $2, is_completed = $3, priority = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id = $6 AND user_id = $7
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		query,
		task.Title,
		task.Description,
		task.IsCompleted,
		task.Priority,
		task.DueDate,
		task.ID,
		task.UserID,
	).Scan(&task.UpdatedAt)

	if err == sql.ErrNoRows {
		return fmt.Errorf("task not found or unauthorized")
	}

	if err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}

	return nil
}

func (r *TaskRepository) Delete(id int, userID int) error {
	query := `DELETE FROM tasks WHERE id = $1 AND user_id = $2`

	result, err := r.db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("task not found or unauthorized")
	}

	return nil
}

func (r *TaskRepository) GetCompletedCount(userID int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND is_completed = true`

	err := r.db.QueryRow(query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get completed count: %w", err)
	}

	return count, nil
}