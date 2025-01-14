// A data structure for working with minerals, implemented with Go's type safety principles in mind.
// Defines the Mineral model with fields: unique identifier, title, description, paths to preview and 3D model, and creation timestamp.
// Uses struct tags for flexible serialization/deserialization between JSON and database formats.
// Supports extensibility through optional fields and strict typing.

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
