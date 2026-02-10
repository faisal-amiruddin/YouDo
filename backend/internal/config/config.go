package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type ServerConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host string
	Port string
	User string
	Password string
	DBName string
	SSLMode string
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
}

type SecurityConfig struct {
	RateLimitRequest int
	RateLimitDuration time.Duration
	CORSAllowedOrigins []string
}

type LogConfig struct {
	Level string
}

type Config struct {
	Server ServerConfig
	Database DatabaseConfig
	JWT JWTConfig
	Security SecurityConfig
	Log LogConfig
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)

	if value != "" {
		return value
	}
	return defaultValue
}

func parseInt(value string, defaultValue int) int {
	if i, err := strconv.Atoi(value); err == nil {
		return i
	}

	return defaultValue
}

func parseDuration(value string, defaultValue time.Duration) time.Duration {
	if d, err := time.ParseDuration(value); err == nil {
		return d
	}

	return defaultValue
}

func parseSlice(value string) []string {
	if value == "" {
		return []string{}
	}

	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))

	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func (c *Config) Validate() error {
	if c.JWT.Secret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}

	if c.Database.Password == "" && c.Server.Env == "production" {
		return fmt.Errorf("DB_PASSWORD is required in production!")
	}

	return nil
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env: getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host: getEnv("DB_HOST", "localhost"),
			Port: getEnv("DB_PORT", "5432"),
			User: getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName: getEnv("DB_NAME", "youdo_db"),
			SSLMode: getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", ""),
			Expiry: parseDuration(getEnv("JWT_EXPIRY", "24h"), 24*time.Hour),
		},
		Security: SecurityConfig{
			RateLimitRequest: parseInt(getEnv("RATE_LIMIT_REQUESTS", "100"), 100),
			RateLimitDuration: parseDuration(getEnv("RATE_LIMIT_DURATION", "1m"), time.Minute),
			CORSAllowedOrigins: parseSlice(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
		},
		Log: LogConfig{
			Level: getEnv("LOG_LEVEL", "info"),
		},
	}

	err := config.Validate()
	
	if err != nil {
		return nil, err
	}

	return config, nil
}