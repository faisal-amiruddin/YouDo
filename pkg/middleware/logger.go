package middleware

import (
	"time"

	"github.com/faisal-amiruddin/YouDo/pkg/utils"
	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		duration := time.Since(start)

		utils.LogRequest(
			c.Request.Method,
			c.Request.URL.Path,
			c.ClientIP(),
			duration,
		)

		if len(c.Errors) > 0 {
			utils.Error("Request errors: %v", c.Errors.String())
		}
	}
}