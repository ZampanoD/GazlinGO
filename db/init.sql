CREATE TABLE IF NOT EXISTS minerals (
                                        id SERIAL PRIMARY KEY,
                                        title VARCHAR(255) NOT NULL,
    description TEXT,
    model_path VARCHAR(255),
    preview_image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_minerals_title ON minerals(title);

CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    favorites integer[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );