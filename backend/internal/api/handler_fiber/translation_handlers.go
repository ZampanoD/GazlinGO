// internal/api/handler_fiber/translation_handlers.go

package handler_fiber

import (
	"backend/internal/api/errors"
	"backend/internal/models"
	"backend/internal/service/translation"
	stderrors "errors"
	"github.com/gofiber/fiber/v2"
	"log"
)

// Получение списка доступных языков
func (h *Handler) GetAvailableLanguages(c *fiber.Ctx) error {
	languages := h.translationService.GetSupportedLanguages()
	if len(languages) == 0 {
		log.Printf("Предупреждение: список поддерживаемых языков пуст")
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   languages,
	})
}

// Получение минерала на определенном языке
func (h *Handler) GetTranslatedMineral(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("некорректный id"))
	}

	targetLang := c.Query("lang")
	if targetLang == "" {
		targetLang = "ru" // Язык по умолчанию
	}

	if !h.translationService.IsLanguageSupported(targetLang) {
		return errors.SendError(c, errors.ErrInvalidInput("язык не поддерживается"))
	}

	mineral, err := h.db.GetMineralByID(id)
	if err != nil {
		return errors.SendError(c, errors.ErrNotFound("минерал не найден"))
	}

	// Если запрошенный язык совпадает с исходным, возвращаем без перевода
	if targetLang == "ru" {
		return c.JSON(fiber.Map{
			"status": "success",
			"data":   mineral,
		})
	}

	// Переводим название
	translatedTitle, err := h.translationService.Translate(mineral.Title, "ru", targetLang)
	if err != nil {
		switch {
		case stderrors.Is(err, translation.ErrServiceUnavailable):
			log.Printf("Сервис переводов недоступен: %v", err)
			return errors.SendError(c, errors.NewAPIError(
				fiber.StatusServiceUnavailable,
				"Сервис переводов временно недоступен",
				err.Error(),
			))
		case stderrors.Is(err, translation.ErrTranslationFailed):
			log.Printf("Ошибка перевода: %v", err)
			return errors.SendError(c, errors.NewAPIError(
				fiber.StatusInternalServerError,
				"Ошибка при выполнении перевода",
				err.Error(),
			))
		case stderrors.Is(err, translation.ErrEmptyText):
			log.Printf("Пустой текст для перевода: %v", err)
			return c.JSON(fiber.Map{
				"status": "success",
				"data":   mineral, // Возвращаем оригинал, если текст пустой
			})
		default:
			log.Printf("Неизвестная ошибка при переводе: %v", err)
			return errors.SendError(c, errors.ErrServerError)
		}
	}

	// Переводим описание
	translatedDescription, err := h.translationService.Translate(mineral.Description, "ru", targetLang)
	if err != nil {
		switch {
		case stderrors.Is(err, translation.ErrServiceUnavailable):
			log.Printf("Сервис переводов недоступен: %v", err)
			return errors.SendError(c, errors.NewAPIError(
				fiber.StatusServiceUnavailable,
				"Сервис переводов временно недоступен",
				err.Error(),
			))
		case stderrors.Is(err, translation.ErrTranslationFailed):
			log.Printf("Ошибка перевода: %v", err)
			return errors.SendError(c, errors.NewAPIError(
				fiber.StatusInternalServerError,
				"Ошибка при выполнении перевода",
				err.Error(),
			))
		case stderrors.Is(err, translation.ErrEmptyText):
			translatedDescription = "" // Если текст пустой, оставляем пустым
		default:
			log.Printf("Неизвестная ошибка при переводе: %v", err)
			return errors.SendError(c, errors.ErrServerError)
		}
	}

	// Создаем копию минерала с переведенными полями
	translatedMineral := models.Mineral{
		ID:               mineral.ID,
		Title:            translatedTitle,
		Description:      translatedDescription,
		ModelPath:        mineral.ModelPath,        // Оставляем оригинальный путь
		PreviewImagePath: mineral.PreviewImagePath, // Оставляем оригинальный путь
		CreatedAt:        mineral.CreatedAt,
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   translatedMineral,
	})
}

// Получение всех минералов на определенном языке
func (h *Handler) GetAllTranslatedMinerals(c *fiber.Ctx) error {
	targetLang := c.Query("lang")
	if targetLang == "" {
		targetLang = "ru" // Язык по умолчанию
	}

	if !h.translationService.IsLanguageSupported(targetLang) {
		return errors.SendError(c, errors.ErrInvalidInput("язык не поддерживается"))
	}

	minerals, err := h.db.GetAllMinerals()
	if err != nil {
		log.Printf("Ошибка при получении минералов: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	// Если запрошен русский язык, возвращаем без перевода
	if targetLang == "ru" {
		return c.JSON(fiber.Map{
			"status": "success",
			"data":   minerals,
		})
	}

	// Переводим все минералы
	translatedMinerals := make([]models.Mineral, len(minerals))
	translateErrors := 0
	for i, mineral := range minerals {
		// Переводим название
		translatedTitle, err := h.translationService.Translate(mineral.Title, "ru", targetLang)
		if err != nil {
			log.Printf("Ошибка при переводе заголовка для минерала %d: %v", mineral.ID, err)
			if stderrors.Is(err, translation.ErrServiceUnavailable) {
				return errors.SendError(c, errors.NewAPIError(
					fiber.StatusServiceUnavailable,
					"Сервис переводов временно недоступен",
					err.Error(),
				))
			}
			translateErrors++
			translatedTitle = mineral.Title // Используем оригинальное название при ошибке
		}

		// Переводим описание
		translatedDescription, err := h.translationService.Translate(mineral.Description, "ru", targetLang)
		if err != nil {
			log.Printf("Ошибка при переводе описания для минерала %d: %v", mineral.ID, err)
			if stderrors.Is(err, translation.ErrServiceUnavailable) {
				return errors.SendError(c, errors.NewAPIError(
					fiber.StatusServiceUnavailable,
					"Сервис переводов временно недоступен",
					err.Error(),
				))
			}
			translateErrors++
			translatedDescription = mineral.Description // Используем оригинальное описание при ошибке
		}

		translatedMinerals[i] = models.Mineral{
			ID:               mineral.ID,
			Title:            translatedTitle,
			Description:      translatedDescription,
			ModelPath:        mineral.ModelPath,
			PreviewImagePath: mineral.PreviewImagePath,
			CreatedAt:        mineral.CreatedAt,
		}
	}

	if translateErrors > 0 {
		log.Printf("Предупреждение: %d ошибок перевода", translateErrors)
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   translatedMinerals,
	})
}

// Поиск минералов с учетом языка
func (h *Handler) SearchTranslatedMinerals(c *fiber.Ctx) error {
	query := c.Query("query")
	targetLang := c.Query("lang", "ru")

	if query == "" {
		return errors.SendError(c, errors.ErrInvalidInput("поисковый запрос не может быть пустым"))
	}

	if !h.translationService.IsLanguageSupported(targetLang) {
		return errors.SendError(c, errors.ErrInvalidInput("язык не поддерживается"))
	}

	minerals, err := h.db.SearchMineralByTitle(query)
	if err != nil {
		log.Printf("Ошибка при поиске минералов: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	if targetLang == "ru" {
		return c.JSON(fiber.Map{
			"status": "success",
			"data":   minerals,
		})
	}

	translatedMinerals := make([]models.Mineral, 0, len(minerals))
	for _, mineral := range minerals {
		translatedTitle, err := h.translationService.Translate(mineral.Title, "ru", targetLang)
		if err != nil {
			if stderrors.Is(err, translation.ErrServiceUnavailable) {
				return errors.SendError(c, errors.NewAPIError(
					fiber.StatusServiceUnavailable,
					"Сервис переводов временно недоступен",
					err.Error(),
				))
			}
			log.Printf("Ошибка перевода заголовка для минерала %d: %v", mineral.ID, err)
			continue
		}

		translatedDescription, err := h.translationService.Translate(mineral.Description, "ru", targetLang)
		if err != nil {
			if stderrors.Is(err, translation.ErrServiceUnavailable) {
				return errors.SendError(c, errors.NewAPIError(
					fiber.StatusServiceUnavailable,
					"Сервис переводов временно недоступен",
					err.Error(),
				))
			}
			log.Printf("Ошибка перевода описания для минерала %d: %v", mineral.ID, err)
			continue
		}

		translatedMinerals = append(translatedMinerals, models.Mineral{
			ID:               mineral.ID,
			Title:            translatedTitle,
			Description:      translatedDescription,
			ModelPath:        mineral.ModelPath,
			PreviewImagePath: mineral.PreviewImagePath,
			CreatedAt:        mineral.CreatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   translatedMinerals,
	})
}
