package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type RateLimiter struct {
	clients map[string]*client
	mu      sync.RWMutex
	rate    rate.Limit
	burst   int
}

func NewRateLimiter(requestsPerDuration int, duration time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*client),
		rate:    rate.Limit(float64(requestsPerDuration) / duration.Seconds()),
		burst:   requestsPerDuration,
	}

	go rl.cleanupClients()

	return rl
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		rl.mu.Lock()
		if _, exists := rl.clients[ip]; !exists {
			rl.clients[ip] = &client{
				limiter:  rate.NewLimiter(rl.rate, rl.burst),
				lastSeen: time.Now(),
			}
		}
		rl.clients[ip].lastSeen = time.Now()
		limiter := rl.clients[ip].limiter
		rl.mu.Unlock()

		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func (rl *RateLimiter) cleanupClients() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		for ip, client := range rl.clients {
			if time.Since(client.lastSeen) > 3*time.Minute {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}