package database

import (
	"database/sql"
	"errors"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"os"
)


var (
	ErrMineralNotFound   = errors.New("mineral not found")
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidPassword   = errors.New("invalid password")
	ErrUserAlreadyExists = errors.New("user already exists")
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}


func GetConfig() Config {
	if os.Getenv("DOCKER_ENV") == "true" {
		return Config{
			Host:     getEnv("DB_HOST", "db"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "404118"),
			DBName:   getEnv("DB_NAME", "minerals"),
		}
	}

	return Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "404118"),
		DBName:   getEnv("DB_NAME", "minerals"),
	}
}


func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}


type Database struct {
	DB *sql.DB
}


func (c Config) GetDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.Host, c.Port, c.User, c.Password, c.DBName)
}


func NewDatabase() (*Database, error) {
	config := GetConfig()
	log.Printf("Attempting to connect to database with config: %+v", config)

	db, err := sql.Open("postgres", config.GetDSN())
	if err != nil {
		return nil, fmt.Errorf("error opening database: %v", err)
	}


	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %v", err)
	}

	log.Printf("Successfully connected to database")


	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)

	return &Database{DB: db}, nil
}


func (db *Database) Close() error {
	if db.DB != nil {
		return db.DB.Close()
	}
	return nil
}
