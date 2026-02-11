package main

import (
	"fmt"
	"log"

	"github.com/faisal-amiruddin/YouDo/backend/internal/config"
	"github.com/faisal-amiruddin/YouDo/backend/internal/database"
	"github.com/faisal-amiruddin/YouDo/backend/internal/handler"
	"github.com/faisal-amiruddin/YouDo/backend/internal/middleware"
	"github.com/faisal-amiruddin/YouDo/backend/internal/repository"
	"github.com/faisal-amiruddin/YouDo/backend/internal/service"
	"github.com/faisal-amiruddin/YouDo/backend/internal/utils"
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Anjay Mabar")
	fmt.Println("Cihuyyy")

	cfg, err := config.Load()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	utils.InitLogger(cfg.Log.Level)
	utils.Info("Starting YouDo API Server...")
	utils.Info("Environment: %s", cfg.Server.Env)

	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	db, err := database.Connect(&cfg.Database)

	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}
	defer database.Close(db)

	userRepo := repository.NewUserRepository(db)
	taskRepo := repository.NewTaskRepository(db)

	authService := service.NewAuthService(userRepo, cfg.JWT.Secret, "24h")
	taskService := service.NewTaskService(taskRepo)

	authHandler := handler.NewAuthHandler(authService)
	taskHandler := handler.NewTaskHandler(taskService)

	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg.Security.CORSAllowedOrigins))
	router.Use(middleware.SecurityHeaders())

	rateLimiter := middleware.NewRateLimiter(
		cfg.Security.RateLimitRequest,
		cfg.Security.RateLimitDuration,
	)
	router.Use(rateLimiter.Middleware())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "YouDo API",
		})
	})

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		tasks := api.Group("/tasks")
		tasks.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			tasks.POST("", taskHandler.CreateTask)
			tasks.GET("", taskHandler.GetAllTasks)
			tasks.GET("/:id", taskHandler.GetTask)
			tasks.PUT("/:id", taskHandler.UpdateTask)
			tasks.DELETE("/:id", taskHandler.DeleteTask)
		}
	}

	serverAddr := fmt.Sprintf(":%s", cfg.Server.Port)
	utils.Info("🚀 Server is running on http://localhost%s", serverAddr)

	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}