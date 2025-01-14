// A centralized module for handling and standardizing errors in the application.
// Defines custom error types for various scenarios: authentication, data validation, file operations.
// Ensures consistent formatting of HTTP error responses, including status codes, informative messages, and traceability for debugging.
// Serves as a key component for creating a predictable and secure API.

package errors

import "github.com/gofiber/fiber/v2"

type APIError struct {
	StatusCode int    `json:"status_code"`
	Message    string `json:"message"`
	Detail     string `json:"detail,omitempty"`
}

func (e *APIError) Error() string {
	if e.Detail != "" {
		return e.Message + ": " + e.Detail
	}
	return e.Message
}

func NewAPIError(statusCode int, message string, detail string) *APIError {
	return &APIError{
		StatusCode: statusCode,
		Message:    message,
		Detail:     detail,
	}
}

func SendError(c *fiber.Ctx, err *APIError) error {
	return c.Status(err.StatusCode).JSON(fiber.Map{
		"error":  err.Message,
		"detail": err.Detail,
	})
}

var (
	ErrInvalidInput = func(detail string) *APIError {
		return NewAPIError(fiber.StatusBadRequest, "Некорректные входные данные", detail)
	}

	ErrNotFound = func(resource string) *APIError {
		return NewAPIError(fiber.StatusNotFound, "Ресурс не найден", resource)
	}

	ErrUnauthorized = NewAPIError(fiber.StatusUnauthorized, "Требуется авторизация", "")

	ErrForbidden = NewAPIError(fiber.StatusForbidden, "Доступ запрещен", "")

	ErrServerError = NewAPIError(fiber.StatusInternalServerError, "Внутренняя ошибка сервера", "")

	ErrFileTooBig = func(detail string) *APIError {
		return NewAPIError(fiber.StatusBadRequest, "Размер файла слишком большой", detail)
	}

	ErrInvalidTypeFile = func(detail string) *APIError {
		return NewAPIError(fiber.StatusBadRequest, "Неподдерживаемый тип файлов", detail)
	}

	ErrFileOperation = func(detail string) *APIError {
		return NewAPIError(fiber.StatusInternalServerError, "Ошибка при работе с файлом", detail)
	}
)
