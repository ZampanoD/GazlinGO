//Специализированный обработчик файловых операций, отвечающий за загрузку, сохранение и управление мультимедийным контентом минералов.
//Реализует robust механизмы работы с файлами: валидация расширений, контроль размера, генерация уникальных имен, безопасное сохранение на файловой системе.
//Интегрирует логику файлового сервиса с HTTP-протоколом, обеспечивая безопасную и эффективную работу с превью и 3D-моделями минералов.

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
