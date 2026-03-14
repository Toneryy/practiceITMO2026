# ITMOtify — Architecture Overview

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │                    FRONTEND (Vite + React)                      │    │
│   │                      localhost:5173                             │    │
│   │                                                                 │    │
│   │   Pages → Stores (MobX) → fetch('/api/...')                    │    │
│   └──────────────────────────────┬─────────────────────────────────┘    │
│                                  │  /api/* (Vite proxy)                  │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
                    ───────────────▼───────────────
                    │                             │
          ┌─────────▼──────────┐       ┌─────────▼──────────┐
          │  EXPRESS SERVER    │       │   SQLITE DATABASE   │
          │  server.ts         │◄─────►│   prisma/dev.db     │
          │  localhost:3001    │       │   (Prisma ORM)      │
          └────────────────────┘       └─────────────────────┘
```

---

## Project Root Structure

```
practiceITMO2026/
│
├── 📁 src/                  ← FRONTEND (React SPA)
├── 📁 prisma/               ← DATABASE (schema + migrations + seed)
│
├── server.ts                ← BACKEND ENTRY (Express API, port 3001)
├── vite.config.ts           ← FRONTEND build + dev server + proxy
├── index.html               ← SPA root HTML
│
├── tsconfig.json            ← TypeScript root config
├── tsconfig.app.json        ← Frontend TS config (React)
├── tsconfig.node.json       ← Backend TS config (server.ts, seed.ts)
└── package.json
```

---

## Backend

```
server.ts                     Express entry point (port 3001)
│
└── REST API Routes
    ├── GET  /api/tracks               → tracks.service → Prisma
    ├── GET  /api/tracks/:id           → tracks.service → Prisma
    ├── GET  /api/artists              → artists.service → Prisma
    ├── GET  /api/artists/:name        → artists.service → Prisma
    ├── GET  /api/playlists            → playlists.service → Prisma
    ├── POST /api/playlists            → playlists.service → Prisma
    ├── PUT  /api/playlists/:id/rename → playlists.service → Prisma
    ├── PUT  /api/playlists/:id/image  → playlists.service → Prisma
    ├── PUT  /api/playlists/:id/pinned → playlists.service → Prisma
    ├── POST /api/playlists/:id/tracks → playlists.service → Prisma
    ├── PUT  /api/playlists/:id/reorder→ playlists.service → Prisma
    ├── DEL  /api/playlists/:id        → playlists.service → Prisma
    ├── GET  /api/favorites/trackNames → favorites.service → Prisma
    ├── POST /api/favorites/toggle     → favorites.service → Prisma
    ├── GET  /api/subscriptions        → subscriptions.service → Prisma
    └── POST /api/subscriptions/toggle → subscriptions.service → Prisma

prisma/
├── schema.prisma             Database schema (SQLite)
│   ├── model User            id
│   ├── model Artist          id, name, image, listenersCount, bio
│   ├── model Album           id, name, cover, artistId
│   ├── model Track           id, name, file, cover, duration, explicit, artistId, albumId
│   ├── model Lyrics          id, trackId, lines (JSON)
│   ├── model Playlist        id, name, image, pinned, userId
│   ├── model PlaylistTrack   playlistId, trackId, position
│   ├── model UserFavorite    userId, trackId
│   └── model UserSubscription userId, artistId
│
├── seed.ts                   DB seeding script (Last.fm API + SoundHelix audio)
└── migrations/               SQL migration history
    ├── 20260314141038_init/
    ├── 20260314142218_add_explicit_field/
    └── 20260314160000_add_artist_bio/

src/services/                 Prisma service functions (called by server.ts)
├── db.ts                     PrismaClient singleton
└── api/
    ├── tracks.service.ts      getTracks, getTrackById
    ├── artists.service.ts     getArtists, getArtistByName
    ├── playlists.service.ts   getPlaylists, createPlaylist, toggleTrackInPlaylist …
    ├── favorites.service.ts   getFavoriteTrackNames, toggleFavorite
    └── subscriptions.service.ts  getSubscribedArtistNames, toggleSubscription
```

---

## Frontend

### Folder Structure

```
src/
│
├── main.tsx                  App entry — ReactDOM.render + i18n init
├── App.tsx                   Router + global data fetch on mount
├── index.css                 Global styles (Tailwind base)
│
├── config/
│   └── pages.config.ts       Route path constants (PagesConfig static class)
│
├── types/                    Shared TypeScript interfaces
│   ├── track.types.ts        ITrack
│   ├── artist.types.ts       IArtist
│   └── menu.types.ts         IMenuItem
│
├── i18n/                     Internationalisation (react-i18next)
│   ├── index.ts              i18next config + language detector
│   └── locales/
│       ├── en.json           English translations
│       └── ru.json           Russian translations
│
├── store/                    Global state (MobX)
│   ├── player.store.ts       Playback state, queue, shuffle, repeat
│   ├── catalog.store.ts      Tracks + artists list (fetched from API)
│   ├── playlist.store.ts     User playlists (fetched + mutated via API)
│   ├── favorite.store.ts     Liked track names (fetched + toggled via API)
│   ├── subscription.store.ts Subscribed artist names (fetched + toggled via API)
│   └── language.store.ts     Active UI language
│
├── hooks/
│   └── useDecodedParam.ts    Decodes URL params (encodeURIComponent)
│
├── data/                     Legacy static data (used only for type reference)
│   ├── tracks.data.ts
│   ├── artist.data.ts
│   ├── lyrics.data.ts
│   └── menu.data.ts          Left-sidebar navigation items
│
├── pages/                    Route-level page components
│   ├── HomePage.tsx           / — Featured artist + popular tracks
│   ├── SearchPage.tsx         /search — Smart search (songs + artists)
│   ├── DiscoverPage.tsx       /discover — Trending artists + albums
│   ├── ArtistsPage.tsx        /artists — All artists grid
│   ├── ArtistPage.tsx         /artists/:name — Artist profile + tracks + bio
│   ├── AlbumsPage.tsx         /albums — All albums grid
│   ├── AlbumPage.tsx          /albums/:name — Album track listing
│   ├── PlaylistPage.tsx       /playlist/:id — User playlist
│   ├── LikedSongsPage.tsx     /liked-songs — Favorited tracks
│   └── RecentlyPlayedPage.tsx /recently-played — Play history
│
├── components/
│   │
│   ├── layout/               Application shell (rendered once, wraps all pages)
│   │   ├── Layout.tsx         3-column grid + AudioPlayer
│   │   ├── left-sidebar/
│   │   │   ├── LeftSidebar.tsx
│   │   │   ├── Menu.tsx       Reusable nav link list
│   │   │   └── SidebarPlaylists.tsx  User playlist list + create button
│   │   └── right-sidebar/
│   │       ├── RightSidebar.tsx  Renders Lyrics or Queue panel
│   │       ├── Lyrics.tsx     Synced scrolling lyrics
│   │       ├── Lyrics.module.scss
│   │       └── Queue.tsx      Current playback queue + drag-reorder
│   │
│   ├── elements/             Feature-specific composite components
│   │   ├── player/
│   │   │   ├── AudioPlayer.tsx     Bottom playback bar
│   │   │   ├── FullscreenPlayer.tsx  Fullscreen overlay player
│   │   │   └── useAudioPlayer.tsx  <audio> element ref + sync with playerStore
│   │   ├── track-table/
│   │   │   └── TrackTable.tsx     Sortable track list (used on most pages)
│   │   ├── track-item/
│   │   │   ├── Track.tsx          Card-style track row
│   │   │   └── TrackOptionsMenu.tsx  ⋯ context menu (queue, playlist, share, details…)
│   │   └── search-field/
│   │       └── SearchField.tsx    Reusable search input (used on HomePage)
│   │
│   └── ui/                   Generic, reusable UI primitives
│       ├── album-card/        AlbumCard
│       ├── artist-card/       ArtistCard
│       ├── breadcrumbs/       Breadcrumbs
│       ├── confirm-modal/     ConfirmModal (delete playlist, etc.)
│       ├── custom-menu/       CustomMenu
│       ├── explicit-badge/    ExplicitBadge (「E」marker)
│       ├── page-container/    PageContainer (title + breadcrumbs wrapper)
│       ├── progress-bar/      ProgressBar (playback + volume sliders)
│       └── track-info/        TrackInfo (cover + title + subtitle)
│
└── utils/
    └── transform-duration.ts  Format seconds → "m:ss"
```

---

### Frontend Data Flow

```
  Browser action (click Play / search / toggle like)
         │
         ▼
    Page / Component
         │
         ▼
    MobX Store          ◄──────── localStorage (offline fallback)
    (synchronous UI update)
         │  fetch('/api/...')
         ▼
    Vite Proxy (:5173)
         │  forwards to
         ▼
    Express (:3001)
         │
         ▼
    Prisma Service
         │
         ▼
    SQLite DB
         │
         ▼  JSON response
    MobX Store (runInAction → re-renders observers)
         │
         ▼
    React Component (re-renders)
```

---

### MobX Store Relationships

```
catalogStore          playerStore
(tracks, artists) ──► (currentTrack, queue, isPlaying…)
        │
        ▼
favoriteStore         subscriptionStore      playlistStore
(favoritesName[])     (subscribedNames[])    (playlists[])
        │                      │                    │
        └──────────────────────┴────────────────────┘
                               │
                         API calls to
                         Express server
```

---

### Component Hierarchy (Runtime)

```
<App>
 ├── <BrowserRouter>
 │    ├── <FullscreenPlayer>          (portal overlay)
 │    ├── <Toaster>                   (sonner, portal)
 │    └── <Layout>
 │         ├── <LeftSidebar>
 │         │    ├── <Menu> (main nav)
 │         │    ├── <Menu> (library)
 │         │    └── <SidebarPlaylists>
 │         ├── <main>  [page outlet]
 │         │    ├── <HomePage>
 │         │    ├── <SearchPage>
 │         │    ├── <DiscoverPage>
 │         │    ├── <ArtistPage>
 │         │    ├── <AlbumPage>
 │         │    ├── <PlaylistPage>
 │         │    ├── <LikedSongsPage>
 │         │    └── …
 │         ├── <RightSidebar>         (conditional: lyrics/queue open)
 │         │    ├── <Lyrics>
 │         │    └── <Queue>
 │         └── <AudioPlayer>          (fixed bottom bar)
 │              └── <audio> element
 └── (modals rendered via createPortal into document.body)
      ├── TrackDetailsModal
      ├── ConfirmModal (delete playlist)
      └── TrackOptionsMenu submenu (add to playlist)
```

---

### Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| State management | MobX 6 + mobx-react-lite |
| Routing | React Router v7 |
| i18n | i18next + react-i18next |
| Icons | Lucide React |
| Toasts | Sonner |
| Drag & drop | @dnd-kit |
| Backend | Express.js (Node.js) |
| ORM | Prisma 6 |
| Database | SQLite (dev.db) |
| API transport | REST / JSON |
| Dev proxy | Vite built-in proxy (`/api` → `:3001`) |
