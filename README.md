# 🌍 GazlinGO - Information System for Working with 3D Mineral Models

GazlinGO is a web application for interactive viewing and managing a collection of 3D mineral models. The system provides a user-friendly interface for working with 3D models, their descriptions, and classification. Developed using a modern technology stack.

## ✨ Key Features

- 👀 Interactive viewing of 3D mineral models
- 🔒 Authentication and authorization system (users/admins)
- ⚡ Mineral collection management (CRUD operations for admins)
- ⭐ Adding minerals to favorites
- 🔍 Search and sorting of minerals
- 🎛️ Customizable 3D viewer:
  - Auto-rotation
  - Enhanced lighting
  - Coordinate grid
  - Dark theme
- 📱 Responsive interface for all devices
- 🌐 Multilingual interface:
  - Russian
  - English
  - French
  - German
  - Spanish

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Three.js / React Three Fiber (for 3D)
- Tailwind CSS (styling)
- React Context (state and localization management)
- Axios (HTTP client)

### Backend
- Go
- Fiber (web framework)
- PostgreSQL
- JWT (authentication)
- Lingva Translate (for translations)

### Infrastructure
- Docker
- Docker Compose

## 📁 Project Structure


```
project/
├── frontend/        # React application
├── backend/         # Go API server
├── db/              # Database files
│ ├── init.sql       # Database initialization
│ └── Dockerfile
└── docker-compose.yml
```

## 🚀 Running the Project

### Requirements
- Docker
- Docker Compose

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ZampanoD/GazlinGO.git
cd gazlingo
```

2. Create a .env file:
```env
JWT_SECRET=your_jwt_secret
```

3. Start with Docker Compose:
```bash
docker-compose up -d
```

4. Access the services:

     - Frontend: http://localhost:5173
      - Backend API: http://localhost:8080
      - Database: localhost:5432
      - Translation service: localhost:5050

## 🔌 API Endpoints

### Public
```
GET /api/v1/minerals            # List of minerals
GET /api/v1/minerals/:id        # Mineral details
GET /api/v1/minerals-translated # Translated list
GET /api/v1/languages          # Available languages
POST /api/v1/register          # Registration
POST /api/v1/login             # Login
GET /api/v1/find-minerals      # Search
```

### Protected (requires authentication)
```
POST /api/v1/favorites/:id     # Add to favorites
DELETE /api/v1/favorites/:id   # Remove from favorites
```

### Administrative
```
POST /api/v1/admin/minerals    # Create
PUT /api/v1/admin/minerals/:id # Update
DELETE /api/v1/admin/minerals/:id # Delete
```

## 💡 Implementation Features

- 🏭 Optimized Docker builds

- 🔄 Automatic database migrations

- 🎮 GLB model support
- 🔐 JWT authentication

- 👥 Role-based access control

- 📁 File management

- 🌍 Multilingual support

## 🔒 Security

- 📦 Client-side caching
- 📊 Database indexing
- 🚀 Optimized Docker images
- 🎯 Efficient 3D model loading



## ⚡ Optimization

- 📦 Кэширование на клиенте
- 📊 Индексация БД
- 🚀 Оптимизация Docker образов
- 🎯 Эффективная загрузка 3D моделей

## 👨‍💻 Author

Dmitry Lyubaznov