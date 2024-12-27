package main

import (
	"backend/internal/api/handler_fiber"
	"backend/internal/api/middleware"
	"backend/internal/database"
	"backend/internal/service/file"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"log"
	"os"
	"path/filepath"
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


	projectDir, err := os.Getwd()
	if err != nil {
		log.Fatal("Ошибка получения рабочей директории: ", err)
	}

	parentDir := filepath.Dir(projectDir)
	log.Printf("Родительская директория: %s", parentDir)

	storagePath := filepath.Join(parentDir, "storage")
	err = os.MkdirAll(storagePath, 0755)
	if err != nil {
		log.Fatal("Ошибка создания storage директории: ", err)
	}
	log.Printf("Storage директория: %s", storagePath)


	fileService, err := file.NewFileService(parentDir)
	if err != nil {
		log.Fatal("Ошибка инициализации файлового сервиса: ", err)
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


	app.Static("/storage", storagePath, fiber.Static{
		Browse: true,
		Index:  "index.html",
		MaxAge: 3600,
	})

	h := handler_fiber.New(db, fileService)


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
		log.Printf("%s %s", route.Method, route.Path)
	}


	log.Println("Сервер запускается на порту :8080")
	if err := app.Listen(":8080"); err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}
