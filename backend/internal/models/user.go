//Модуль определяет структуры данных для управления пользователями. Ключевой объект User содержит полную информацию
//о пользователе: уникальный идентификатор, имя, роль (user/admin), время создания и список избранных элементов.
//Реализована система ролей с четким разграничением прав, структуры для аутентификации (LoginRequest) и ответа после
//входа (LoginResponse). Особое внимание уделено безопасности - пароль не сериализуется в JSON, используется специальный
//тип для хранения массива избранного.

package models

import (
	"github.com/lib/pq"
	"time"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID        int           `json:"id"`
	Username  string        `json:"username"`
	Password  string        `json:"-"`
	Role      Role          `json:"role" db:"role"`
	CreatedAt time.Time     `json:"createdAt" db:"created_at"`
	Favorites pq.Int64Array `json:"favorites" db:"favorites"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	Role  Role   `json:"role"`
}
