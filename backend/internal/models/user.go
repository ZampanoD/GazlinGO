// The module defines data structures for managing users. The key object, User, contains complete user information:
// unique identifier, username, role (user/admin), creation time, and a list of favorite items.
// Implements a role system with clear access control, structures for authentication (LoginRequest), and post-login responses (LoginResponse).
// Special attention is given to security - passwords are not serialized in JSON, and a dedicated type is used for storing the favorites array.

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
