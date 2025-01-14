// A translation service that provides multilingual support in the application.
// Implements translation caching for performance optimization, error handling, and translation service availability checks.
// Supports translation between all major system languages (Russian, English, French, German, Spanish).


package translation

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

var (
	ErrTranslationFailed    = errors.New("translation failed")
	ErrLanguageNotSupported = errors.New("language not supported")
	ErrServiceUnavailable   = errors.New("translation service is unavailable")
	ErrInvalidResponse      = errors.New("invalid response from translation service")
	ErrEmptyText            = errors.New("empty text provided for translation")
)

type TranslationService struct {
	baseURL            string
	supportedLanguages map[string]bool
	client             *http.Client
	mu                 sync.RWMutex
	cache              map[string]string
	cacheMu            sync.RWMutex
}
type translateResponse struct {
	Info struct {
		SourceLanguage string `json:"sourceLanguage"`
		TargetLanguage string `json:"targetLanguage"`
	} `json:"info"`
	Translation string `json:"translation"`
}

type Language struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

func NewTranslationService(baseURL string) *TranslationService {
	return &TranslationService{
		baseURL: baseURL,
		supportedLanguages: map[string]bool{
			"ru": true,
			"en": true,
			"es": true,
			"fr": true,
			"de": true,
		},
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		cache: make(map[string]string),
	}
}

func (s *TranslationService) checkServiceAvailability() error {
	resp, err := s.client.Get(s.baseURL)
	if err != nil {
		return fmt.Errorf("service health check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("service returned status code: %d", resp.StatusCode)
	}

	return nil
}

func (s *TranslationService) getCacheKey(text, sourceLang, targetLang string) string {
	return fmt.Sprintf("%s:%s:%s", sourceLang, targetLang, text)
}

func (s *TranslationService) IsLanguageSupported(langCode string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.supportedLanguages[langCode]
}

func (s *TranslationService) GetSupportedLanguages() []Language {
	s.mu.RLock()
	defer s.mu.RUnlock()

	languages := make([]Language, 0, len(s.supportedLanguages))
	for code := range s.supportedLanguages {
		languages = append(languages, Language{
			Code: code,
			Name: getLanguageName(code),
		})
	}
	return languages
}

func (s *TranslationService) Translate(text, sourceLang, targetLang string) (string, error) {

	cacheKey := s.getCacheKey(text, sourceLang, targetLang)
	s.cacheMu.RLock()
	if cached, ok := s.cache[cacheKey]; ok {
		s.cacheMu.RUnlock()
		return cached, nil
	}
	s.cacheMu.RUnlock()

	log.Printf("Starting translation: text='%s', sourceLang='%s', targetLang='%s'", text, sourceLang, targetLang)

	if text == "" {
		log.Println("Empty text provided for translation")
		return "", ErrEmptyText
	}

	if !s.IsLanguageSupported(targetLang) {
		log.Printf("Unsupported target language: %s", targetLang)
		return "", fmt.Errorf("%w: %s", ErrLanguageNotSupported, targetLang)
	}
	encodedText := strings.ReplaceAll(url.QueryEscape(text), "+", "%20")
	apiURL := fmt.Sprintf("%s/api/v1/%s/%s/%s", s.baseURL, sourceLang, targetLang, encodedText)

	log.Printf("Making translation request to URL: %s", apiURL)

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		return "", fmt.Errorf("error creating request: %w", err)
	}
	log.Printf("Full request details: URL=%s, Headers=%v", apiURL, req.Header)

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	log.Printf("Request headers: %v", req.Header)

	resp, err := s.client.Do(req)
	if err != nil {
		log.Printf("Error making request: %v", err)
		return "", fmt.Errorf("%w: %v", ErrServiceUnavailable, err)
	}
	defer resp.Body.Close()

	log.Printf("Response status code: %d", resp.StatusCode)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return "", fmt.Errorf("error reading response body: %w", err)
	}

	log.Printf("Response body: %s", string(body))

	if resp.StatusCode != http.StatusOK {
		log.Printf("Unexpected status code: %d", resp.StatusCode)
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var result translateResponse
	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("Error decoding response: %v", err)
		return "", fmt.Errorf("error decoding response: %w", err)
	}

	if result.Translation == "" {
		log.Println("Empty translation received")
		return "", ErrTranslationFailed
	}

	log.Printf("Successfully translated text to: %s", result.Translation)
	s.cacheMu.Lock()
	s.cache[cacheKey] = result.Translation
	s.cacheMu.Unlock()

	return result.Translation, nil
}

func getLanguageName(code string) string {
	names := map[string]string{
		"en": "English",
		"es": "Español",
		"fr": "Français",
		"de": "Deutsch",
		"ru": "Русский",
	}

	if name, ok := names[code]; ok {
		return name
	}
	return code
}
func (s *TranslationService) CheckAvailability() error {
	testURL := fmt.Sprintf("%s/api/v1/ru/en/test", s.baseURL)
	resp, err := s.client.Get(testURL)
	if err != nil {
		return fmt.Errorf("service health check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("service returned status code: %d", resp.StatusCode)
	}

	return nil
}
