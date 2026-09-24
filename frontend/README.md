# Student Information System — Frontend

Frontend приложение на React + Vite для системы аналитики студенческого фидбека (Sprint 1 & SIS Portal), реализованное в точном соответствии с Figma-дизайном.

## Стек технологий

- **React 18** (JavaScript, без TypeScript и сложных абстракций)
- **Vite 6** (быстрая сборка, dev-сервер с proxy на бэкенд)
- **React Router 6** (клиентская маршрутизация)
- **Чистый CSS** (дизайн-токены, CSS-переменные, адаптивная верстка desktop/tablet/mobile)

## Структура проекта

```
frontend/
├── src/
│   ├── assets/
│   │   └── icons.jsx            # SVG-иконки (логотип SIS AI со стрелкой, пользователь, замок)
│   ├── components/
│   │   ├── Header.jsx           # Шапка SIS с логотипом и названием страницы
│   │   ├── Sidebar.jsx          # Боковое меню навигации (HOME PAGE, MY COURSES, GIVE FEEDBACK...)
│   │   └── ProtectedRoute.jsx   # Защита маршрутов от неавторизованного доступа
│   ├── context/
│   │   └── AuthContext.jsx      # Управление состоянием авторизации
│   ├── layouts/
│   │   ├── MainLayout.jsx       # Основной лэйаут с Header и Sidebar
│   │   └── MainLayout.css
│   ├── pages/
│   │   ├── LoginPage.jsx        # Экран входа (синий полигон, подчеркнутые инпуты, переключатель ролей)
│   │   ├── MyCoursesPage.jsx    # Страница курсов и карточка студента
│   │   ├── GiveFeedbackPage.jsx # Форма отправки отзыва (SELECT COURSE, TEXT HERE, SEND)
│   │   └── ViewFeedbackPage.jsx # Таблица отзывов (ID, FEEDBACK, FEEDBACK DATE, STATUS)
│   ├── services/
│   │   ├── api.js               # Базовый HTTP-клиент
│   │   ├── auth.js              # Аутентификация (/api/v1/auth/login, logout, me)
│   │   ├── courses.js           # Получение курсов (/api/v1/courses)
│   │   └── feedback.js          # Логика отправки и сохранения отзывов
│   ├── App.jsx                  # Корневой компонент с роутингом
│   ├── index.css                # Глобальные стили и шрифты
│   └── main.jsx                 # Точка входа React
├── index.html                   # HTML-шаблон
├── package.json
└── vite.config.js               # Конфигурация Vite с proxy на FastAPI backend (порт 8000)
```

## Запуск проекта

### 1. Запуск Backend (в корне проекта)
```powershell
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```
Backend будет доступен по адресу: http://127.0.0.1:8000

### 2. Запуск Frontend
В отдельном окне терминала в папке `frontend`:
```powershell
cd frontend
npm run dev
```
Frontend будет доступен по адресу: **http://localhost:5173**

## Тестовые учетные записи
- **Student**: `alice.student@university.edu` / `StudentPassword123!`
- **Admin**: `admin@university.edu` / `AdminPassword123!`
