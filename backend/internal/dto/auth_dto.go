package dto

type RegisterRequest struct {
	Name string `json:"name" binding:"required,min=2"`
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
	ID int `json:"id"`
	Email string `json:"email"`
	Name string `json:"name"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User UserResponse `json:"user"`
}