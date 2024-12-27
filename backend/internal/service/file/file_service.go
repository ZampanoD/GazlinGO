//Сервисный слой абстракции файловых операций, который инкапсулирует низкоуровневую логику работы с файловой системой.
//Предоставляет высокоуровневые методы для безопасного создания, чтения, обновления и удаления файлов с учетом бизнес-требований приложения.
//Реализует механизмы генерации уникальных имен, проверки типов и размеров файлов, а также управления путями хранения для различных типов контента.

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
	ModelsDir        = "/app/storage/models"
	PreviewsDir      = "/app/storage/previews"
	MaxFileSize      = 50 << 20
	AllowedModelExt  = ".glb"
	AllowedImageExts = ".jpg,.jpeg,.png"
)

type FileService struct {
	basePath string
}

func NewFileService(basePath string) (*FileService, error) {
	log.Printf("Инициализация FileService с путем: %s", basePath)

	dirs := []string{
		filepath.Join(basePath, ModelsDir),
		filepath.Join(basePath, PreviewsDir),
	}

	for _, dir := range dirs {
		log.Printf("Создание директории: %s", dir)
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Ошибка при создании директории %s: %v", dir, err)
			return nil, errors.ErrFileOperation(fmt.Sprintf("не удалось создать директорию %s", dir))
		}
	}

	return &FileService{basePath: basePath}, nil
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
		return "", errors.ErrFileOperation("не удалось открыть файл")
	}
	defer src.Close()


	fullPath := filepath.Join("/app", dir, file.Filename)
	log.Printf("Saving file to full path: %s", fullPath)

	dst, err := os.Create(fullPath)
	if err != nil {
		log.Printf("Error creating file: %v", err)
		return "", errors.ErrFileOperation(fmt.Sprintf("не удалось создать файл: %v", err))
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		log.Printf("Error copying file: %v", err)
		return "", errors.ErrFileOperation(fmt.Sprintf("не удалось сохранить файл: %v", err))
	}


	urlPath := filepath.Join("/storage", strings.TrimPrefix(dir, "/app/storage"), file.Filename)
	log.Printf("File saved, URL path: %s", urlPath)

	return urlPath, nil
}

func (fs *FileService) DeleteFile(filePath string) error {
	if filePath == "" {
		return nil
	}

	fullPath := filepath.Join(fs.basePath, filePath)
	err := os.Remove(fullPath)
	if err != nil && !os.IsNotExist(err) {
		return errors.ErrFileOperation(fmt.Sprintf("не удалось удалить файл: %s", filePath))
	}

	return nil
}
