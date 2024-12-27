# Gazlingo Minerals Frontend 🌍🔬

## 🚀 Архитектура и Технологический Стек

### Основные Технологии
- **Язык**: TypeScript (v4.9+)
- **Библиотека**: React (v18+)
- **Сборщик**: Vite (v4+)
- **Стилизация**: Tailwind CSS (v3+)
- **Состояние**: React Hooks
- **Роутинг**: React Router (v6+)
- **HTTP-клиент**: Axios
- **Анимации**: Framer Motion

### Архитектурные Принципы
- Модульность
- Компонентный подход
- Функциональное программирование
- Типобезопасность
- Разделение ответственности

## 📦 Структура Проекта

```
frontend/
│
├── public/                 # Статические ресурсы
│   ├── models/             # 3D-модели минералов
│   └── images/             # Изображения
│
├── src/
│   ├── components/         # Реакт-компоненты
│   │   ├── Layout/         # Макеты страниц
│   │   ├── Auth/           # Компоненты авторизации
│   │   ├── Minerals/       # Компоненты для работы с минералами
│   │   └── UI/             # Переиспользуемые UI-компоненты
│   │
│   ├── hooks/              # Кастомные React хуки
│   │   ├── useAuth.ts      # Хук аутентификации
│   │   └── useNotification.ts  # Хук уведомлений
│   │
│   ├── services/           # Сервисы для работы с API
│   │   ├── api.ts          # Базовый API-клиент
│   │   └── mineralService.ts  # Сервис для работы с минералами
│   │
│   ├── types/              # TypeScript типы
│   │   ├── Mineral.ts      # Типы минералов
│   │   └── User.ts         # Типы пользователей
│   │
│   ├── utils/              # Утилиты
│   │   ├── formatters.ts   # Форматирование данных
│   │   └── validators.ts   # Валидаторы
│   │
│   ├── context/            # React Context
│   │   └── AuthContext.tsx # Контекст аутентификации
│   │
│   ├── styles/             # Глобальные стили
│   │   └── index.css       # Основной CSS с Tailwind
│   │
│   └── App.tsx             # Корневой компонент
│
├── config/                 # Конфигурационные файлы
│   ├── vite.config.ts      # Настройки Vite
│   └── tailwind.config.ts  # Конфигурация Tailwind
│
└── tests/                  # Тесты
    ├── components/         # Тесты компонентов
    └── services/           # Тесты сервисов
```

## 🔧 Установка и Настройка

### Prerequisites
- Node.js 16+ 
- npm 8+
- Установленный backend API

### Шаги установки
```bash
# Клонирование репозитория
git clone https://github.com/your-username/gazlingo-minerals.git
cd gazlingo-minerals/frontend

# Установка зависимостей
npm install

# Копирование env-файла
cp .env.example .env

# Локальный запуск
npm run dev
```

### Переменные окружения
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_3D_MODELS_PATH=/models
VITE_ENABLE_LOGGING=true
```

## 🚀 Скрипты npm

```bash
# Локальный запуск
npm run dev

# Сборка для продакшена
npm run build

# Линтинг
npm run lint

# Тестирование
npm run test

# Превью продакшен сборки
npm run preview
```

## 🧪 Тестирование

### Инструменты
- Jest
- React Testing Library
- Cypress (E2E)

```bash
# Юнит и интеграционные тесты
npm run test:unit

# E2E тесты
npm run test:e2e
```

## 🔐 Аутентификация

- JWT-токены
- Защита роутов
- Роли пользователей (User/Admin)
- Персистентность состояния

## 🎨 Ключевые Компоненты

1. `ModelViewer`: 3D визуализация минералов
2. `MineralsList`: Интерактивный список/сетка
3. `SearchBar`: Расширенный поиск
4. `AuthForm`: Формы входа/регистрации
5. `Notification`: Система уведомлений

## 🚀 Производительность

- Code Splitting
- Ленивая загрузка компонентов
- Мемоизация
- Оптимизация рендеринга

## 🌐 Поддержка Браузеров

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Мобильные браузеры

## 🔍 Мониторинг и Логирование

- Sentry для трекинга ошибок
- Логирование на клиенте
- Performance Metrics

## 📝 Лицензия

MIT License

## 🤝 Контрибуция

1. Fork репозитория
2. Создайте feature-branch
3. Commit изменений
4. Push в branch
5. Pull Request

## 📞 Поддержка

[Ваши контактные данные]

---

🌈 **Gazlingo Minerals Frontend** - Исследуйте мир минералов технологично!
