package service

import (
	"fmt"
	"time"

	"github.com/faisal-amiruddin/YouDo/pkg/dto"
	"github.com/faisal-amiruddin/YouDo/pkg/model"
	"github.com/faisal-amiruddin/YouDo/pkg/repository"
	"github.com/faisal-amiruddin/YouDo/pkg/utils"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
	jwtExpiry string
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret, jwtExpiry string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

func (s *AuthService) Register(req *dto.RegisterRequest) (*dto.AuthResponse, error) {
	if !utils.ValidateEmail(req.Email) {
		return nil, fmt.Errorf("invalid email format")
	}

	if !utils.ValidatePassword(req.Password) {
		return nil, fmt.Errorf("password must be at least 8 characters and contain letters and numbers")
	}

	exists, err := s.userRepo.EmailExists(req.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check email: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("email already registered")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &model.User{
		Email:        utils.SanitizeString(req.Email),
		PasswordHash: hashedPassword,
		Name:         utils.SanitizeString(req.Name),
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	expiry, _ := time.ParseDuration(s.jwtExpiry)
	token, err := utils.GenerateToken(user.ID, user.Email, s.jwtSecret, expiry)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		},
	}, nil
}

func (s *AuthService) Login(req *dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	if err := utils.CheckPassword(user.PasswordHash, req.Password); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	expiry, _ := time.ParseDuration(s.jwtExpiry)
	token, err := utils.GenerateToken(user.ID, user.Email, s.jwtSecret, expiry)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
		},
	}, nil
}