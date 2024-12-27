//Middleware-модуль аутентификации, который перехватывает и обрабатывает HTTP-запросы для проверки прав доступа.
//Реализует механизм JWT-токенизации с валидацией подписи, извлечением claims и разграничением
//доступа между ролями пользователей. Обеспечивает криптографическую безопасность через проверку целостности токена,
//время жизни и привязку к конкретному пользователю.
//Интегрирован с механизмами Fiber для seamless внедрения в HTTP-pipeline приложения.

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
