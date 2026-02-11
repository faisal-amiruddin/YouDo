package service

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/faisal-amiruddin/YouDo/backend/internal/dto"
	"github.com/faisal-amiruddin/YouDo/backend/internal/model"
	"github.com/faisal-amiruddin/YouDo/backend/internal/repository"
	"github.com/faisal-amiruddin/YouDo/backend/internal/utils"
)

type TaskService struct {
	taskRepo *repository.TaskRepository
}

func NewTaskService(taskRepo *repository.TaskRepository) *TaskService {
	return &TaskService{taskRepo: taskRepo}
}

func (s *TaskService) CreateTask(userID int, req *dto.CreateTaskRequest) (*dto.TaskResponse, error) {
	priority := model.PriorityMedium
	if req.Priority != "" {
		priority = model.Priority(req.Priority)
	}

	var dueDate sql.NullTime
	if req.DueDate != nil && *req.DueDate != "" {
		parsed, err := time.Parse(time.RFC3339, *req.DueDate)
		if err != nil {
			return nil, fmt.Errorf("invalid due_date format, use ISO 8601 (e.g., 2024-12-31T23:59:59Z)")
		}
		dueDate = sql.NullTime{Time: parsed, Valid: true}
	}

	task := &model.Task{
		UserID:      userID,
		Title:       utils.SanitizeString(req.Title),
		Description: utils.SanitizeString(req.Description),
		Priority:    priority,
		DueDate:     dueDate,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return s.toTaskResponse(task), nil
}

func (s *TaskService) GetTask(taskID, userID int) (*dto.TaskResponse, error) {
	task, err := s.taskRepo.GetByID(taskID, userID)
	if err != nil {
		return nil, err
	}

	return s.toTaskResponse(task), nil
}

func (s *TaskService) GetAllTasks(userID int) (*dto.TaskListResponse, error) {
	tasks, err := s.taskRepo.GetAllByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tasks: %w", err)
	}

	taskResponses := make([]dto.TaskResponse, len(tasks))
	for i, task := range tasks {
		taskResponses[i] = *s.toTaskResponse(&task)
	}

	return &dto.TaskListResponse{
		Tasks: taskResponses,
		Total: len(taskResponses),
	}, nil
}

func (s *TaskService) UpdateTask(taskID, userID int, req *dto.UpdateTaskRequest) (*dto.TaskResponse, error) {
	task, err := s.taskRepo.GetByID(taskID, userID)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		task.Title = utils.SanitizeString(*req.Title)
	}
	if req.Description != nil {
		task.Description = utils.SanitizeString(*req.Description)
	}
	if req.IsCompleted != nil {
		task.IsCompleted = *req.IsCompleted
	}
	if req.Priority != nil {
		task.Priority = model.Priority(*req.Priority)
	}
	if req.DueDate != nil {
		if *req.DueDate == "" {
			task.DueDate = sql.NullTime{Valid: false}
		} else {
			parsed, err := time.Parse(time.RFC3339, *req.DueDate)
			if err != nil {
				return nil, fmt.Errorf("invalid due_date format, use ISO 8601 (e.g., 2024-12-31T23:59:59Z)")
			}
			task.DueDate = sql.NullTime{Time: parsed, Valid: true}
		}
	}

	if err := s.taskRepo.Update(task); err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return s.toTaskResponse(task), nil
}

func (s *TaskService) DeleteTask(taskID, userID int) error {
	return s.taskRepo.Delete(taskID, userID)
}

func (s *TaskService) toTaskResponse(task *model.Task) *dto.TaskResponse {
	response := &dto.TaskResponse{
		ID:          task.ID,
		UserID:      task.UserID,
		Title:       task.Title,
		Description: task.Description,
		IsCompleted: task.IsCompleted,
		Priority:    string(task.Priority),
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}

	if task.DueDate.Valid {
		response.DueDate = &task.DueDate.Time
	}

	return response
}