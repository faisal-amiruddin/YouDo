package handler

import (
	"net/http"
	"sync"

	"github.com/faisal-amiruddin/YouDo/pkg/config"
	"github.com/faisal-amiruddin/YouDo/pkg/database"
	"github.com/faisal-amiruddin/YouDo/pkg/handler"
	"github.com/faisal-amiruddin/YouDo/pkg/middleware"
	"github.com/faisal-amiruddin/YouDo/pkg/repository"
	"github.com/faisal-amiruddin/YouDo/pkg/service"
	"github.com/faisal-amiruddin/YouDo/pkg/utils"

	_ "github.com/faisal-amiruddin/YouDo/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

var (
	router *gin.Engine
	once   sync.Once
)

func initRouter() {
	cfg, _ := config.Load()

	utils.InitLogger(cfg.Log.Level)

	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	db, _ := database.Connect(&cfg.Database)

	userRepo := repository.NewUserRepository(db)
	taskRepo := repository.NewTaskRepository(db)

	authService := service.NewAuthService(userRepo, cfg.JWT.Secret, "24h")
	taskService := service.NewTaskService(taskRepo)

	authHandler := handler.NewAuthHandler(authService)
	taskHandler := handler.NewTaskHandler(taskService)

	router = gin.New()

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

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := router.Group("/api")

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

func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(initRouter)
	router.ServeHTTP(w, r)
}
