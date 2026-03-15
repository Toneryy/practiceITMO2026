# ITMOtify — Архитектура проекта

## Обзор системы

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              БРАУЗЕР                                     │
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │                    FRONTEND (Vite + React)                       │    │
│   │                      localhost:5173                             │    │
│   │                                                                  │    │
│   │   Pages → MobX Stores → authFetch('/api/...')                    │    │
│   └──────────────────────────────┬─────────────────────────────────┘    │
│                                  │  /api/* (Vite proxy)                  │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
                    ───────────────▼───────────────
          ┌─────────────────────────────┐       ┌─────────────────────┐
          │  EXPRESS SERVER (server.ts)  │◄─────►│  SQLite (Prisma)     │
          │  localhost:3001              │       │  prisma/dev.db       │
          └─────────────────────────────┘       └─────────────────────┘
```

---

## Структура проекта

```
practiceITMO2026/
├── src/                      # Frontend (React SPA)
├── prisma/                   # Схема БД, миграции, seed
├── server.ts                 # Backend (Express API)
├── vite.config.ts            # Vite + proxy /api → 3001
├── index.html
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── package.json
├── .env                      # DATABASE_URL, JWT_SECRET, LASTFM_API_KEY
└── .env.example
```

---

## База данных (Prisma + SQLite)

### Модели

| Модель | Описание |
|--------|----------|
| **User** | username, email, password (bcrypt), avatar; гостевой `default-user` для неавторизованных |
| **Artist** | name, image, listenersCount, bio |
| **Album** | name, cover, artistId |
| **Track** | name, file, cover, duration, explicit, artistId, albumId |
| **Lyrics** | trackId, lines (JSON) |
| **Playlist** | name, image, pinned, order, userId |
| **PlaylistTrack** | playlistId, trackId, order |
| **UserFavorite** | userId, trackId |
| **UserSubscription** | userId, artistId |
| **ListenHistory** | userId, trackId, playedAt (индексы: userId+playedAt, userId+trackId) |

### Сид

`prisma/seed.ts` — загрузка артистов (Deezer, Last.fm), треков (SoundHelix), текстов песен. Создаёт `default-user` для гостевого режима.

---

## Backend (Express)

### Auth

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация (username, email, password) |
| POST | /api/auth/login | Вход (email, password) → JWT + user |
| GET | /api/auth/me | Профиль (Bearer token) |
| PUT | /api/auth/avatar | Обновление аватара |

### Listen History

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/listen-history | Добавить прослушивание (Bearer token, trackName) |
| GET | /api/listen-history | История прослушиваний (limit) |

### Tracks, Artists, Lyrics

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/tracks | Список (q, artistId, albumId, limit, offset) |
| GET | /api/tracks/:id | Трек по ID |
| GET | /api/artists | Все артисты |
| GET | /api/artists/:name | Артист по имени |
| GET | /api/lyrics/:trackId | Текст по trackId |
| GET | /api/lyrics/by-name/:trackName | Текст по имени трека |

### Playlists (userId из Bearer или query/body)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/playlists | Список плейлистов |
| POST | /api/playlists | Создать |
| PUT | /api/playlists/:id/rename | Переименовать |
| PUT | /api/playlists/:id/image | Обложка |
| PUT | /api/playlists/:id/pinned | Закрепить |
| POST | /api/playlists/:id/tracks | Добавить/убрать трек (toggle) |
| PUT | /api/playlists/:id/reorder | Переупорядочить |
| DEL | /api/playlists/:id | Удалить |

### Favorites / Subscriptions

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/favorites/trackNames | Избранные (имена) |
| POST | /api/favorites/toggle | Добавить/убрать |
| GET | /api/subscriptions | Подписки (имена артистов) |
| POST | /api/subscriptions/toggle | Подписаться/отписаться |

### Middleware

- **authMiddleware** — извлекает userId из Bearer токена
- **getUserId(req)** — `req.userId` || query.userId || body.userId || `'default-user'`
- **requireAuth** — 401, если нет токена (для /api/auth/me, /api/listen-history)
- **ensureDefaultUser()** — при старте сервера создаёт `default-user`, если его нет

---

## Frontend

### Структура `src/`

```
src/
├── main.tsx
├── App.tsx                   # Router, initListenHistoryReaction, fetchStores
├── index.css                 # Tailwind
│
├── config/pages.config.ts    # Константы маршрутов
├── types/                    # ITrack, IArtist, IMenuItem
├── i18n/                     # i18next, en.json, ru.json
│
├── store/
│   ├── player.store.ts       # Плеер: currentTrack, queue, isPlaying, repeat, shuffle, recentTracks
│   ├── catalog.store.ts      # Треки, артисты (fetchAll)
│   ├── playlist.store.ts     # Плейлисты (CRUD, add track)
│   ├── favorite.store.ts     # Избранное (authFetch)
│   ├── subscription.store.ts # Подписки (authFetch)
│   ├── auth.store.ts         # JWT, login, register, logout, authFetch (401 → logout)
│   ├── language.store.ts     # Язык UI (en/ru)
│   └── listen-history.reaction.ts  # MobX reaction: фиксация прослушивания через 30 сек
│
├── hooks/useDecodedParam.ts
├── data/menu.data.ts
│
├── pages/
│   ├── HomePage.tsx
│   ├── SearchPage.tsx        # Поиск по трекам и артистам (score-based)
│   ├── DiscoverPage.tsx
│   ├── ArtistsPage.tsx, ArtistPage.tsx
│   ├── AlbumsPage.tsx, AlbumPage.tsx
│   ├── PlaylistPage.tsx      # Создание, переименование, удаление плейлиста
│   ├── LikedSongsPage.tsx
│   ├── RecentlyPlayedPage.tsx # In-memory + API (ListenHistory)
│   ├── LoginPage.tsx, RegisterPage.tsx
│   ├── ProfilePage.tsx       # Профиль, статистика, недавно прослушанные
│   └── SettingsPage.tsx      # Язык, плеер, уведомления, приватность, кэш
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx        # Иконка профиля / Войти, dropdown: профиль, язык, настройки, выход
│   │   ├── left-sidebar/    # Menu, SidebarPlaylists
│   │   └── right-sidebar/   # Lyrics, Queue
│   ├── elements/
│   │   ├── player/          # AudioPlayer, FullscreenPlayer, useAudioPlayer
│   │   ├── track-table/     # TrackTable
│   │   └── track-item/     # Track, TrackOptionsMenu (add to playlist, share, lyrics…)
│   └── ui/                  # AlbumCard, ArtistCard, Breadcrumbs, ConfirmModal, CustomMenu, etc.
│
└── utils/transform-duration.ts
```

### MobX Stores

```
catalogStore ──────► playerStore (currentTrack, queue, isPlaying…)
       │
       ▼
authStore (userId, token, authFetch)
       │
       ├──► favoriteStore
       ├──► subscriptionStore
       ├──► playlistStore
       └──► listen-history.reaction (30s threshold, track played → API)
```

### Поток данных

1. Пользователь → Page/Component
2. Component → MobX Store (action)
3. Store → `authFetch('/api/...')` (Authorization: Bearer при наличии)
4. Vite Proxy → Express
5. Express → Prisma Service → SQLite
6. Ответ → `runInAction` → обновление store → re-render

### Listen History: схема реакции

```
playerStore.currentTrack меняется
         │
         ▼
MobX reaction (listen-history.reaction.ts)
         │
         ├─► Трек включился? → Запуск 30-секундного таймера
         │
         ├─► Трек сменился/остановлен? → Очистка таймера, сброс
         │
         └─► Прошло 30 сек (или половина трека)? → POST /api/listen-history
                     │
                     ▼
              authStore.token → Bearer в заголовке (или пропуск для гостя)
```

История прослушиваний фиксируется **только** для авторизованных пользователей и только после 30 секунд воспроизведения (или половины длительности трека). Для гостей — локальный in-memory список в `playerStore.recentTracks`.

---

## Ключевые особенности

- **Аутентификация**: JWT в localStorage; `authFetch` при 401 делает `logout`
- **Гость**: `default-user` для избранного, плейлистов, подписок без входа
- **Listen History**: MobX `reaction` на `currentTrack`; фиксация через 30 сек (антиспам)
- **Поиск**: скоринг по названию трека и имени артиста; без совпадений — 0, в результатах только релевантные
- **i18n**: en/ru
- **Плейлисты**: создание, переименование (на странице и в сайдбаре), добавление треков из TrackOptionsMenu

---

## Tech Stack

| Слой | Технологии |
|------|------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind v4 |
| State | MobX 6, mobx-react-lite |
| Routing | React Router v7 |
| i18n | i18next, react-i18next |
| UI | Lucide React, Sonner, @dnd-kit |
| Backend | Express, Prisma 6, SQLite |
| Auth | JWT, bcryptjs |
