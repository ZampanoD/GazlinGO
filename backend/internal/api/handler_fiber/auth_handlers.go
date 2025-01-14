// A specialized handler for authentication routes, managing user registration, login, and logout processes.
// Implements cryptographically secure mechanisms for JWT token generation, password hashing, and credential validation.
// Integrates authentication business logic with the HTTP protocol, ensuring secure management of user sessions
// and access control to protected application resources.

package handler_fiber

import (
	"backend/internal/api/middleware"
	"backend/internal/database"
	"backend/internal/models"
	"github.com/gofiber/fiber/v2"
)

type RegisterRequest struct {
	Username string      `json:"username"`
	Password string      `json:"password"`
	Role     models.Role `json:"role"`
}

func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Поля должны быть заполнены обязательно",
		})
	}

	if req.Role == "" {
		req.Role = models.RoleUser
	}

	user, err := h.db.CreateUser(req.Username, req.Password, req.Role)
	if err != nil {

		if err == database.ErrUserAlreadyExists {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Пользователь уже существует",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при создании пользователя: " + err.Error(),
		})
	}

	token, err := middleware.GenerateToken(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при создании токена",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user":  user,
		"token": token,
	})
}
func (h *Handler) Login(c *fiber.Ctx) error {
	var loginReq models.LoginRequest
	if err := c.BodyParser(&loginReq); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}

	user, err := h.db.AuthenticateUser(loginReq.Username, loginReq.Password)
	if err != nil {
		if err == database.ErrUserNotFound || err == database.ErrInvalidPassword {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Неверное имя пользователя или пароль",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка сервера",
		})
	}

	token, err := middleware.GenerateToken(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при создании токена",
		})
	}

	return c.JSON(models.LoginResponse{
		Token: token,
		Role:  user.Role,
	})
}
