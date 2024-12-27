//Структура данных для работы с минералами, реализованная с учетом принципов типобезопасности Go.
//Определяет модель Mineral с полями: уникальный идентификатор, название, описание, пути к превью и 3D-модели,
//временная метка создания. Использует теги struct mapping для гибкой сериализации/десериализации между форматами JSON
//и базы данных. Поддерживает расширяемость через необязательные поля и строгую типизацию.

package models

import (
	"errors"
	"strings"
	"time"
)

const (
	MaxTitleLength        = 255
	MaxDescriptionWords   = 512
	AllowedModelExtension = ".glb"
)

var (
	ErrEmptyTitle       = errors.New("название минерала не может быть пустым")
	ErrTitleTooLong     = errors.New("название минерала слишком длинное")
	ErrDescriptionLimit = errors.New("описание превышает максимальную длину")
	ErrInvalidModelPath = errors.New("некорректный путь к модели")
)

type Mineral struct {
	ID               int       `json:"id"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	ModelPath        string    `json:"model_path"`
	PreviewImagePath string    `json:"preview_image_path"`
	CreatedAt        time.Time `json:"created_at"`
}

func (m *Mineral) Validate() error {
	if strings.TrimSpace(m.Title) == "" {
		return ErrEmptyTitle
	}
	if len(m.Title) > MaxTitleLength {
		return ErrTitleTooLong
	}
	if len(strings.Fields(m.Description)) > MaxDescriptionWords {
		return ErrDescriptionLimit
	}
	if !strings.HasSuffix(m.ModelPath, AllowedModelExtension) {
		return ErrInvalidModelPath
	}
	return nil
}
