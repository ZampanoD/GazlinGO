// The entry point for the backend application written in Go using Fiber.
// Main tasks include full system initialization: loading environment variables, connecting to a PostgreSQL database,
// configuring the file service, and setting up an HTTP server with middleware for authentication, logging, and CORS handling.
// Key aspects include strict configuration validation (JWT_SECRET is mandatory),
// dynamic creation of a directory for file storage, and secure routing with access control separation between users and administrators.

package main

import (
	"backend/internal/api/handler_fiber"
	"backend/internal/api/middleware"
	"backend/internal/database"
	"backend/internal/service/file"
	"backend/internal/service/translation"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found")
	}
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	db, err := database.NewDatabase()
	if err != nil {
		log.Fatal("Ошибка подключения к БД: ", err)
	}
	defer db.DB.Close()

	storagePath := "/app/storage"
	log.Printf("Storage директория: %s", storagePath)

	fileService, err := file.NewFileService("/app")
	if err != nil {
		log.Fatal("Ошибка инициализации файлового сервиса: ", err)
	}

	baseURL := "http://translate:3000"
	if os.Getenv("DOCKER_ENV") != "true" {
		baseURL = "http://localhost:5050"
	}
	translationService := translation.NewTranslationService(baseURL)
	if translationService == nil {
		log.Fatal("Ошибка инициализации сервиса переводов")
	}

	if err := translationService.CheckAvailability(); err != nil {
		log.Printf("Warning: Translation service is not available: %v", err)
	} else {
		log.Printf("Translation service is available at %s", baseURL)
	}

	app := fiber.New(fiber.Config{
		AppName:           "GazlinGO Api",
		StrictRouting:     true,
		EnablePrintRoutes: true,
		BodyLimit:         100 * 1024 * 1024,
	})

	app.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusOK)
		}
		return c.Next()
	})

	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
		Output: os.Stdout,
	}))

	app.Use("/storage", func(c *fiber.Ctx) error {
		requestedPath := strings.TrimPrefix(c.Path(), "/storage")
		fullPath := filepath.Join("/app/storage", requestedPath)
		log.Printf("Requested static file: %s (full path: %s)", requestedPath, fullPath)

		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			log.Printf("File not found: %s", fullPath)
			return c.Status(404).SendString("File not found")
		}

		return c.SendFile(fullPath)
	})

	h := handler_fiber.New(db, fileService, translationService)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "GazlinGO Api is running",
		})
	})

	api := app.Group("/api")
	v1 := api.Group("/v1")

	v1.Get("/minerals", h.GetAllMinerals)
	v1.Get("/minerals/:id", h.GetMineralByID)
	v1.Get("/languages", h.GetAvailableLanguages)
	v1.Get("/minerals-translated", h.GetAllTranslatedMinerals)
	v1.Get("/minerals-translated/:id", h.GetTranslatedMineral)

	v1.Post("/login", h.Login)
	v1.Post("/register", h.Register)

	v1.Get("/find-minerals", middleware.AuthMiddleware(), h.SearchMineral)

	admin := v1.Group("/admin", middleware.AuthMiddleware(), middleware.AdminOnly())
	admin.Post("/minerals", h.CreateMineral)
	admin.Put("/minerals/:id", h.UpdateMineral)
	admin.Delete("/minerals/:id", h.DeleteMineral)
	admin.Post("/upload/model", h.UploadModel)
	admin.Post("/upload/preview", h.UploadPreview)

	protected := v1.Group("", middleware.AuthMiddleware())
	protected.Post("/favorites/:id", h.AddToFavorites)
	protected.Delete("/favorites/:id", h.RemoveFromFavorites)
	protected.Get("/favorites", h.GetUserFavorites)

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
	}))

	log.Println("Зарегистрированные маршруты:")
	for _, route := range app.GetRoutes() {
		if route.Method != "HEAD" && route.Method != "CONNECT" &&
			route.Method != "OPTIONS" && route.Method != "TRACE" {
			log.Printf("%s %s", route.Method, route.Path)
		}
	}

	log.Println("Сервер запускается на порту :8080")
	if err := app.Listen(":8080"); err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}
