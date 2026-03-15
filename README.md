# ITMOtify

Музыкальный стриминговый сервис в стиле Spotify — учебный проект на React, Express и SQLite.

---

## Возможности

### Музыка
- **Прослушивание** — воспроизведение треков, очередь, shuffle, repeat
- **Тексты песен** — синхронизированные с прокруткой
- **Полноэкранный плеер** — оверлей с визуализацией
- **Поиск** — по трекам и исполнителям (ранжирование по релевантности)
- **Недавно слушали** — история для авторизованных (30+ секунд прослушивания) и локальная для гостей

### Библиотека
- **Плейлисты** — создание, переименование, удаление, добавление треков, смена обложки, закрепление
- **Избранное** — лайки треков, привязанные к аккаунту
- **Подписки** — подписка на исполнителей

### Аккаунт
- **Регистрация и вход** — email + пароль, JWT-сессии
- **Профиль** — аватар, статистика (лайки, плейлисты, подписки, прослушивания)
- **Настройки** — язык, качество звука, уведомления, приватность (UI)
- **Кнопка входа / иконка профиля** — в шапке, выпадающее меню (профиль, язык, настройки, выход)

### Интерфейс
- **Сайдбар** — навигация, библиотека, плейлисты
- **Тёмная тема** — единый стиль
- **i18n** — русский и английский
- **Адаптивная сетка** — артисты, альбомы, треки

---

## Стек технологий

| Слой      | Технологии                          |
|-----------|--------------------------------------|
| Frontend  | React 19, TypeScript, Vite 7, Tailwind CSS v4 |
| Состояние | MobX 6, mobx-react-lite             |
| Роутинг   | React Router v7                      |
| Backend   | Express.js, Node.js                  |
| БД        | SQLite, Prisma 6                     |
| Аутентификация | JWT (jsonwebtoken), bcryptjs   |

---

## Быстрый старт

### Требования
- Node.js 18+
- npm или yarn

### Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd practiceITMO2026

# Установить зависимости
npm install

# Создать .env (скопировать из .env.example)
cp .env.example .env

# Заполнить .env:
# DATABASE_URL="file:./prisma/dev.db"
# JWT_SECRET="your-secret-key"
# LASTFM_API_KEY="..." (опционально, для сида)
```

### База данных

```bash
# Применить миграции
npx prisma migrate dev

# Заполнить данными (артисты, треки, тексты — Last.fm + SoundHelix)
npm run db:seed
```

### Запуск

```bash
# Frontend (Vite :5173) + Backend (Express :3001)
npm run dev:all
```

Откройте http://127.0.0.1:5173

---

## Скрипты

| Команда         | Описание                    |
|-----------------|-----------------------------|
| `npm run dev`   | Только фронтенд (Vite)      |
| `npm run server`| Только API (Express)        |
| `npm run dev:all`| Фронт + API                 |
| `npm run build` | Сборка production           |
| `npm run db:generate` | Prisma Client          |
| `npm run db:migrate`  | Миграции               |
| `npm run db:seed`    | Заполнение БД         |
| `npm run db:studio`  | Prisma Studio (GUI)   |

---

## Структура проекта

```
practiceITMO2026/
├── src/                    # Frontend (React SPA)
│   ├── components/         # layout, elements, ui
│   ├── pages/              # страницы (Home, Search, Profile, Settings…)
│   ├── store/              # MobX stores (player, auth, catalog, playlist…)
│   ├── services/           # API-сервисы
│   ├── i18n/               # переводы (en, ru)
│   └── types/              # TypeScript-типы
├── prisma/
│   ├── schema.prisma       # схема БД
│   ├── seed.ts             # сид данных
│   └── migrations/
├── server.ts               # Backend (Express API)
├── vite.config.ts
└── package.json
```

Подробнее — в [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Маршруты приложения

| Путь | Страница | Описание |
|------|----------|----------|
| `/` | HomePage | Главная |
| `/search` | SearchPage | Поиск по трекам и артистам |
| `/discover` | DiscoverPage | Рекомендации |
| `/liked-songs` | LikedSongsPage | Избранные треки |
| `/playlist/:id` | PlaylistPage | Плейлист |
| `/artists` | ArtistsPage | Все артисты |
| `/artists/:name` | ArtistPage | Страница артиста |
| `/albums` | AlbumsPage | Все альбомы |
| `/albums/:name` | AlbumPage | Страница альбома |
| `/recently-played` | RecentlyPlayedPage | Недавно прослушанные |
| `/login` | LoginPage | Вход |
| `/register` | RegisterPage | Регистрация |
| `/profile` | ProfilePage | Профиль |
| `/settings` | SettingsPage | Настройки |

---

## API (кратко)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login`   | Вход |
| GET  | `/api/auth/me`      | Текущий пользователь (JWT) |
| GET  | `/api/tracks`       | Треки (q, artistId, limit) |
| GET  | `/api/artists`      | Исполнители |
| GET  | `/api/playlists`    | Плейлисты пользователя |
| POST | `/api/playlists`    | Создание плейлиста |
| POST | `/api/playlists/:id/tracks` | Добавить/убрать трек |
| POST | `/api/favorites/toggle`     | Лайк трека |
| POST | `/api/listen-history`       | Записать прослушивание (30+ сек) |
| GET  | `/api/listen-history`       | История прослушиваний |

---

## Гостевой режим

Без входа используется пользователь `default-user` — плейлисты, лайки и подписки работают локально и привязаны к этому пользователю. Для сохранения истории прослушиваний и личных данных нужен вход.

---

## Лицензия

Учебный проект.
