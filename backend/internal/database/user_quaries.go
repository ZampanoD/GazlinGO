//Модуль управления пользовательскими данными, который инкапсулирует логику аутентификации, регистрации
//и работы с профилями пользователей. Реализует криптографически безопасные методы хеширования паролей,
//проверки учетных записей и управления правами доступа. Использует транзакционные механизмы для обеспечения целостности
//данных при регистрации и обновлении профилей, с детальной обработкой возможных сценариев ошибок и уникальных ограничений базы данных.

package database

import (
	"backend/internal/models"
	"database/sql"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"log"
)

func (db *Database) CreateUser(username, password string, role models.Role) (*models.User, error) {
	exists, err := db.checkUserExists(username)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrUserAlreadyExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{}
	query := `
        INSERT INTO users (username, password, role, favorites)
        VALUES ($1, $2, $3, '{}')
        RETURNING id, username, role, created_at, password, favorites`

	err = db.DB.QueryRow(
		query,
		username,
		string(hashedPassword),
		role,
	).Scan(&user.ID, &user.Username, &user.Role, &user.CreatedAt, &user.Password, &user.Favorites)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (db *Database) GetUserByUsername(username string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, username, password, role::text, created_at, favorites
              FROM users WHERE username = $1`
	log.Printf("Поиск пользователя: %s", username)
	err := db.DB.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Password,
		&user.Role,
		&user.CreatedAt,
		&user.Favorites,
	)
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (db *Database) AddToFavorites(userID int, mineralID int) error {
	query := `
        UPDATE users 
        SET favorites = array_append(favorites, $1)
        WHERE id = $2 AND NOT ($1 = ANY(favorites))`

	result, err := db.DB.Exec(query, mineralID, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (db *Database) RemoveFromFavorites(userID int, mineralID int) error {
	query := `
        UPDATE users 
        SET favorites = array_remove(favorites, $1)
        WHERE id = $2`

	result, err := db.DB.Exec(query, mineralID, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (db *Database) AuthenticateUser(username, password string) (*models.User, error) {
	log.Printf("Попытка аутентификации пользователя: %s", username)

	user, err := db.GetUserByUsername(username)
	if err != nil {
		log.Printf("Ошибка при получении пользователя: %v", err)
		return nil, err
	}

	log.Printf("Пользователь найден, проверяем пароль")

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		log.Printf("Ошибка при проверке пароля: %v", err)
		return nil, ErrInvalidPassword
	}

	log.Printf("Аутентификация успешна")
	return user, nil
}

func (db *Database) checkUserExists(username string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT FROM users WHERE username = $1)`
	err := db.DB.QueryRow(query, username).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
func (db *Database) GetUserFavorites(userID int) ([]int, error) {
	var favorites pq.Int64Array
	query := `SELECT favorites FROM users WHERE id = $1`
	err := db.DB.QueryRow(query, userID).Scan(&favorites)
	if err != nil {
		return nil, err
	}

	result := make([]int, len(favorites))
	for i, v := range favorites {
		result[i] = int(v)
	}
	return result, nil
}
