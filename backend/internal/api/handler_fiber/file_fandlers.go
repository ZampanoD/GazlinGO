// A specialized handler for file operations, responsible for uploading, saving, and managing mineral multimedia content.
// Implements robust file handling mechanisms: extension validation, size control, unique name generation, and secure storage on the file system.
// Integrates file service logic with the HTTP protocol, ensuring secure and efficient handling of mineral previews and 3D models.

package handler_fiber

import (
	"backend/internal/api/errors"
	"github.com/gofiber/fiber/v2"
	"log"
)

func (h *Handler) UploadModel(c *fiber.Ctx) error {

	file, err := c.FormFile("model")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("файл не найден в запросе"))
	}
	log.Printf("Размер загружаемого файла: %d байт", file.Size)

	modelPath, err := h.fileService.SaveModel(file)
	if err != nil {
		return errors.SendError(c, err.(*errors.APIError))
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"path":   modelPath,
	})
}


func (h *Handler) UploadPreview(c *fiber.Ctx) error {

	file, err := c.FormFile("preview")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("файл не найден в запросе"))
	}


	previewPath, err := h.fileService.SavePreview(file)
	if err != nil {
		return errors.SendError(c, err.(*errors.APIError))
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"path":   previewPath,
	})
}
