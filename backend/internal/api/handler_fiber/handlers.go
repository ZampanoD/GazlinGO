// A central module for processing HTTP endpoints, consolidating the logic between client requests and server-side business logic.
// Includes routing for core mineral operations: creation, retrieval, updating, and deletion.
// Implements comprehensive error handling, response formatting, input validation, and integration with application service layers.
// Uses idiomatic Go approaches to build a RESTful API with clear separation of responsibilities.


package handler_fiber

import (
	"backend/internal/api/errors"
	"backend/internal/api/middleware"
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/service/file"
	"backend/internal/service/translation"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt/v4"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Handler struct {
	db                 *database.Database
	fileService        *file.FileService
	translationService *translation.TranslationService
}

func New(db *database.Database, fileService *file.FileService, translationService *translation.TranslationService) *Handler {
	return &Handler{
		db:                 db,
		fileService:        fileService,
		translationService: translationService,
	}
}

func (h *Handler) Routes(app *fiber.App) {

	app.Static("/storage", "./storage", fiber.Static{
		Compress:      true,
		Browse:        true,
		Index:         "index.html",
		CacheDuration: 10 * time.Second,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	api := app.Group("/api")
	v1 := api.Group("/v1")

	log.Println("Регистрация маршрутов API...")

	favorites := v1.Group("/favorites", middleware.AuthMiddleware())
	favorites.Post("/:id", h.AddToFavorites)
	favorites.Delete("/:id", h.RemoveFromFavorites)

	minerals := v1.Group("/minerals")
	minerals.Get("", h.GetAllMinerals)
	minerals.Get("/:id", h.GetMineralByID)

	v1.Get("/find-minerals", middleware.AuthMiddleware(), h.SearchMineral)

	admin := v1.Group("/admin", middleware.AuthMiddleware(), middleware.AdminOnly())
	admin.Post("/minerals", h.CreateMineral)
	admin.Put("/minerals/:id", h.UpdateMineral)
	admin.Delete("/minerals/:id", h.DeleteMineral)
	admin.Post("/upload/model", h.UploadModel)
	admin.Post("/upload/preview", h.UploadPreview)

	auth := v1.Group("/auth")
	auth.Post("/login", h.Login)

	auth.Post("/register", h.Register)

	log.Println("Маршруты успешно зарегистрированы")
}

func (h *Handler) GetAllMinerals(c *fiber.Ctx) error {
	minerals, err := h.db.GetAllMinerals()
	if err != nil {
		log.Printf("Ошибка при получении минералов: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	if minerals == nil {
		minerals = []models.Mineral{}
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   minerals,
	})
}

func (h *Handler) GetMineralByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("некорректный id минерала"))
	}

	mineral, err := h.db.GetMineralByID(id)
	if err != nil {
		if err == database.ErrMineralNotFound {
			return errors.SendError(c, errors.ErrNotFound("минерал не найден"))
		}
		return errors.SendError(c, errors.ErrServerError)
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   mineral,
	})
}

func (h *Handler) CreateMineral(c *fiber.Ctx) error {
	modelDir := "/app/storage/models"
	previewDir := "/app/storage/previews"

	if err := os.MkdirAll(modelDir, os.ModePerm); err != nil {
		log.Printf("Ошибка при создании директории модели: %v", err)
		return errors.SendError(c, errors.ErrFileOperation("Не удалось создать директорию для модели"))
	}
	if err := os.MkdirAll(previewDir, os.ModePerm); err != nil {
		log.Printf("Ошибка при создании директории превью: %v", err)
		return errors.SendError(c, errors.ErrFileOperation("Не удалось создать директорию для превью"))
	}

	modelFile, err := c.FormFile("model")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("Ошибка при загрузке файла модели"))
	}

	previewFile, err := c.FormFile("preview")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("Ошибка при загрузке файла превью"))
	}

	modelPath := "/storage/models/" + modelFile.Filename
	previewImagePath := "/storage/previews/" + previewFile.Filename

	log.Println("Model URL path:", modelPath)
	log.Println("Preview URL path:", previewImagePath)

	title := c.FormValue("title")
	description := c.FormValue("description")

	mineral := &models.Mineral{
		Title:            title,
		Description:      description,
		ModelPath:        modelPath,
		PreviewImagePath: previewImagePath,
		CreatedAt:        time.Now(),
	}

	log.Printf("Mineral: %+v\n", mineral)

	if err := mineral.Validate(); err != nil {
		return errors.SendError(c, errors.ErrInvalidInput(err.Error()))
	}

	fullModelPath := filepath.Join(modelDir, modelFile.Filename)
	log.Println("Saving model file to:", fullModelPath)
	if err := c.SaveFile(modelFile, fullModelPath); err != nil {
		log.Printf("Ошибка при сохранении файла модели: %v", err)
		return errors.SendError(c, errors.ErrFileOperation("Не удалось сохранить файл модели"))
	}
	log.Println("Модель успешно сохранена по пути: ", fullModelPath)

	fullPreviewPath := filepath.Join(previewDir, previewFile.Filename)
	log.Println("Saving preview file to:", fullPreviewPath)
	if err := c.SaveFile(previewFile, fullPreviewPath); err != nil {
		log.Printf("Ошибка при сохранении файла превью: %v", err)
		return errors.SendError(c, errors.ErrFileOperation("Не удалось сохранить файл превью"))
	}
	log.Println("Превью было успешно добавлено ", fullPreviewPath)

	newMineral, err := h.db.CreateMineral(*mineral)
	if err != nil {
		log.Printf("Ошибка при создании минерала: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status": "success",
		"data":   newMineral,
	})
}

func (h *Handler) UpdateMineral(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("некорректный id"))
	}

	currentMineral, err := h.db.GetMineralByID(id)
	if err != nil {
		return errors.SendError(c, errors.ErrNotFound("минерал не найден"))
	}

	title := c.FormValue("title")
	description := c.FormValue("description")

	log.Printf("Получены данные для обновления минерала %d: title=%s, description=%s",
		id, title, description)

	if title != "" {
		currentMineral.Title = title
	}
	if description != "" {
		currentMineral.Description = description
	}

	if modelFile, err := c.FormFile("model"); err == nil {
		modelPath, err := h.fileService.SaveModel(modelFile)
		if err != nil {
			return errors.SendError(c, err.(*errors.APIError))
		}
		currentMineral.ModelPath = modelPath
	}

	if previewFile, err := c.FormFile("preview"); err == nil {
		previewPath, err := h.fileService.SavePreview(previewFile)
		if err != nil {
			return errors.SendError(c, err.(*errors.APIError))
		}
		currentMineral.PreviewImagePath = previewPath
	}

	if err := currentMineral.Validate(); err != nil {
		return errors.SendError(c, errors.ErrInvalidInput(err.Error()))
	}

	updatedMineral, err := h.db.UpdateMineral(*currentMineral)
	if err != nil {
		log.Printf("Ошибка при обновлении минерала в БД: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	log.Printf("Минерал %d успешно обновлен", id)
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   updatedMineral,
	})

}
func (h *Handler) DeleteMineral(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("некорректный id"))
	}

	mineral, err := h.db.GetMineralByID(id)
	if err != nil {
		if err == database.ErrMineralNotFound {
			return errors.SendError(c, errors.ErrNotFound("минерал не найден"))
		}
		log.Printf("Ошибка при получении минерала: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	baseDir := "/app/storage"
	modelFilePath := filepath.Join(baseDir, strings.TrimPrefix(mineral.ModelPath, "/storage"))
	previewFilePath := filepath.Join(baseDir, strings.TrimPrefix(mineral.PreviewImagePath, "/storage"))

	if err := h.db.DeleteMineral(id); err != nil {
		log.Printf("Ошибка при удалении минерала из БД: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	log.Printf("Удаление файла модели: %s", modelFilePath)
	if err := os.Remove(modelFilePath); err != nil {
		log.Printf("Ошибка при удалении файла модели: %v", err)

	}

	log.Printf("Удаление файла превью: %s", previewFilePath)
	if err := os.Remove(previewFilePath); err != nil {
		log.Printf("Ошибка при удалении файла превью: %v", err)

	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) SearchMineral(c *fiber.Ctx) error {
	query := c.Query("query")
	targetLang := c.Query("lang")

	if query == "" {
		return c.JSON(fiber.Map{
			"status": "success",
			"data":   []models.Mineral{},
		})
	}

	minerals, err := h.db.GetAllMinerals()
	if err != nil {
		log.Printf("Ошибка при получении минералов: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	var searchResults []models.Mineral
	for _, mineral := range minerals {
		translatedTitle, err := h.translationService.Translate(mineral.Title, "ru", targetLang)
		if err == nil {

			if strings.HasPrefix(
				strings.ToLower(translatedTitle),
				strings.ToLower(query),
			) {

				translatedMineral := mineral
				translatedMineral.Title = translatedTitle

				translatedDesc, err := h.translationService.Translate(mineral.Description, "ru", targetLang)
				if err == nil {
					translatedMineral.Description = translatedDesc
				}

				searchResults = append(searchResults, translatedMineral)
			}
		}
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   searchResults,
	})
}
func (h *Handler) AddToFavorites(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	userID := int(user["id"].(float64))
	mineralID, err := c.ParamsInt("id")

	if err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("некорректный id минерала"))
	}

	if err := h.db.AddToFavorites(userID, mineralID); err != nil {
		return errors.SendError(c, errors.ErrServerError)
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Минерал добавлен в избранное",
	})
}
func (h *Handler) RemoveFromFavorites(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	userID := int(user["id"].(float64))
	mineralID, err := c.ParamsInt("id")

	if err != nil {
		fmt.Println("Ошибка получения id минерала: ", err)
		return errors.SendError(c, errors.ErrInvalidInput("некорректный id минерала"))
	}

	fmt.Println("Пользователь ID:", userID, "удаляет минерал ID:", mineralID)

	err = h.db.RemoveFromFavorites(userID, mineralID)
	if err != nil {
		fmt.Println("Ошибка удаления из избранного: ", err)
		return errors.SendError(c, errors.ErrServerError)
	}

	fmt.Println("Минерал ID:", mineralID, "успешно удален из избранного для пользователя ID:", userID)
	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Минерал удален из избранного",
	})
}

func (h *Handler) GetUserFavorites(c *fiber.Ctx) error {
	user := c.Locals("user").(jwt.MapClaims)
	userID := int(user["id"].(float64))

	favorites, err := h.db.GetUserFavorites(userID)
	if err != nil {
		return errors.SendError(c, errors.ErrServerError)
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   favorites,
	})
}
