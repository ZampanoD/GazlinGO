// An authentication middleware module that intercepts and processes HTTP requests to verify access rights.
// Implements a JWT tokenization mechanism with signature validation, claims extraction, and role-based access control.
// Ensures cryptographic security through token integrity checks, expiration validation, and user binding.
// Integrated with Fiber mechanisms for seamless embedding into the application's HTTP pipeline.

package middleware

import (
	"backend/internal/api/errors"
	"backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"os"
	"strings"
	"time"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(user *models.User) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["id"] = user.ID
	claims["username"] = user.Username
	claims["role"] = user.Role
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	return token.SignedString(jwtSecret)
}

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return errors.SendError(c, errors.ErrUnauthorized)
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			return errors.SendError(c, errors.ErrUnauthorized)
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Locals("user", claims)
		return c.Next()
	}
}

func AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := c.Locals("user").(jwt.MapClaims)
		if user["role"] != string(models.RoleAdmin) {
			return errors.SendError(c, errors.ErrForbidden)
		}
		return c.Next()
	}
}
