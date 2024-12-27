//Центральный модуль обработки HTTP-эндпоинтов, который консолидирует логику взаимодействия между клиентским запросом и серверной бизнес-логикой.
//Содержит маршрутизацию для основных операций с минералами: создание, получение, обновление и удаление.
//Реализует comprehensive error handling, форматирование ответов, валидацию входящих данных и интеграцию с сервисными слоями приложения.
//Использует идиоматические подходы Go для построения RESTful API с четким разделением ответственности.

package handler_fiber

import (
	"backend/internal/api/errors"
	"backend/internal/api/middleware"
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/service/file"
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
	db          *database.Database
	fileService *file.FileService
}

func New(db *database.Database, fileService *file.FileService) *Handler {
	return &Handler{
		db:          db,
		fileService: fileService,
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
		AllowOrigins: "http://localhost:5173", // URL вашего frontend
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	api := app.Group("/api")
	v1 := api.Group("/v1")

	log.Println("Регистрация маршрутов API...")

	favorites := v1.Group("/favorites", middleware.AuthMiddleware())
	favorites.Post("/:id", h.AddToFavorites)
	favorites.Delete("/:id", h.RemoveFromFavorites)
	// Остальные маршруты остаются без изменений
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
	modelDir := "/storage/models"
	previewDir := "/storage/previews"

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
		ModelPath:        modelPath,        // URL путь
		PreviewImagePath: previewImagePath, // URL путь
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

	var mineral models.Mineral
	if err := c.BodyParser(&mineral); err != nil {
		return errors.SendError(c, errors.ErrInvalidInput("некорректные данные минерала"))
	}

	mineral.ID = id

	if err := mineral.Validate(); err != nil {
		return errors.SendError(c, errors.ErrInvalidInput(err.Error()))
	}

	updatedMineral, err := h.db.UpdateMineral(mineral)
	if err != nil {
		if err == database.ErrMineralNotFound {
			return errors.SendError(c, errors.ErrNotFound("минерал не найден"))
		}
		log.Printf("Ошибка при обновлении минерала: %v", err)
		return errors.SendError(c, errors.ErrServerError)
	}

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

	baseDir := "/storage"
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

	if query == "" {
		return errors.SendError(c, errors.ErrInvalidInput("поисковый запрос не может быть пустым"))
	}

	if len(query) < 2 {
		return errors.SendError(c, errors.ErrInvalidInput("минимальная длина поискового запроса - 2 символа"))
	}

	minerals, err := h.db.SearchMineralByTitle(query)
	if err != nil {
		log.Printf("Ошибка при поиске минерала: %v", err)
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
