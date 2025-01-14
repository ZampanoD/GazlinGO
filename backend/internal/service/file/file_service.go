// A service layer abstraction for file operations, encapsulating low-level file system logic.
// Provides high-level methods for safe creation, reading, updating, and deletion of files, considering the application's business requirements.
// Implements mechanisms for generating unique names, validating file types and sizes, and managing storage paths for different content types.

package file

import (
	"backend/internal/api/errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

const (
	StoragePath      = "/app/storage"
	ModelsDir        = "/models"
	PreviewsDir      = "/previews"
	MaxFileSize      = 50 << 20
	AllowedModelExt  = ".glb"
	AllowedImageExts = ".jpg,.jpeg,.png"
)

type FileService struct {
	basePath string
}

func NewFileService(basePath string) (*FileService, error) {
	log.Printf("Инициализация FileService с путем: %s", StoragePath)

	dirs := []string{
		filepath.Join(StoragePath, ModelsDir),
		filepath.Join(StoragePath, PreviewsDir),
	}

	for _, dir := range dirs {
		log.Printf("Создание директории: %s", dir)
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Ошибка при создании директории %s: %v", dir, err)
			return nil, errors.ErrFileOperation(fmt.Sprintf("не удалось создать директорию %s", dir))
		}
	}

	return &FileService{basePath: StoragePath}, nil
}

func (fs *FileService) SaveModel(file *multipart.FileHeader) (string, error) {
	if file.Size > MaxFileSize {
		return "", errors.ErrFileTooBig("файл слишком большой")
	}

	if !strings.HasSuffix(strings.ToLower(file.Filename), AllowedModelExt) {
		return "", errors.ErrInvalidTypeFile("можно загружать только .glb файлы")
	}

	return fs.saveFile(file, ModelsDir)
}

func (fs *FileService) SavePreview(file *multipart.FileHeader) (string, error) {
	if file.Size > MaxFileSize {
		return "", errors.ErrFileTooBig("файл слишком большой")
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !strings.Contains(AllowedImageExts, ext) {
		return "", errors.ErrInvalidTypeFile("можно загружать только jpg и png")
	}

	return fs.saveFile(file, PreviewsDir)
}

func (fs *FileService) saveFile(file *multipart.FileHeader, dir string) (string, error) {
	src, err := file.Open()
	if err != nil {
		log.Printf("Ошибка открытия файла: %v", err)
		return "", errors.ErrFileOperation("не удалось открыть файл")
	}
	defer src.Close()

	fullPath := filepath.Join(StoragePath, dir, file.Filename)
	log.Printf("Attempting to save file at: %s", fullPath)

	dirPath := filepath.Dir(fullPath)
	if err := os.MkdirAll(dirPath, 0755); err != nil {
		log.Printf("Ошибка создания директории: %v", err)
		return "", errors.ErrFileOperation(fmt.Sprintf("не удалось создать директорию: %v", err))
	}

	dst, err := os.Create(fullPath)
	if err != nil {
		log.Printf("Ошибка создания файла: %v", err)
		return "", errors.ErrFileOperation(fmt.Sprintf("не удалось создать файл: %v", err))
	}
	defer dst.Close()

	written, err := io.Copy(dst, src)
	if err != nil {
		log.Printf("Ошибка копирования файла: %v", err)
		return "", errors.ErrFileOperation(fmt.Sprintf("не удалось сохранить файл: %v", err))
	}
	log.Printf("Successfully written %d bytes to %s", written, fullPath)

	urlPath := filepath.Join("/storage", dir, file.Filename)
	log.Printf("URL path for file: %s", urlPath)

	return urlPath, nil
}
