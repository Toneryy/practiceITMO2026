import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'

dotenv.config()

import { prisma } from './src/services/db.js'
import {
	getArtistByName,
	getArtists
} from './src/services/api/artists.service.js'
import {
	getFavoriteTrackNames,
	toggleFavorite
} from './src/services/api/favorites.service.js'
import {
	createPlaylist,
	deletePlaylist,
	getPlaylists,
	reorderPlaylistTracks,
	renamePlaylist,
	togglePlaylistPinned,
	toggleTrackInPlaylist,
	updatePlaylistImage
} from './src/services/api/playlists.service.js'
import {
	getSubscribedArtistNames,
	toggleSubscription
} from './src/services/api/subscriptions.service.js'
import {
	getTrackById,
	getTracks
} from './src/services/api/tracks.service.js'
import {
	getLyrics,
	getLyricsByTrackName
} from './src/services/api/lyrics.service.js'
import {
	registerUser,
	loginUser,
	verifyToken,
	getUserProfile,
	updateUserAvatar
} from './src/services/api/auth.service.js'
import {
	addListenRecord,
	getListenHistory
} from './src/services/api/listen-history.service.js'

const PORT = 3001
const DEFAULT_USER_ID = 'default-user'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ---------------------------------------------------------------------------
// Auth middleware — extracts userId from Bearer token if present
// ---------------------------------------------------------------------------

declare global {
	namespace Express {
		interface Request {
			userId?: string
		}
	}
}

function authMiddleware(req: Request, _res: Response, next: NextFunction) {
	const header = req.headers.authorization
	if (header?.startsWith('Bearer ')) {
		const userId = verifyToken(header.slice(7))
		if (userId) req.userId = userId
	}
	next()
}

app.use(authMiddleware)

function getUserId(req: Request): string {
	return req.userId ?? (req.query.userId as string) ?? (req.body?.userId as string) ?? DEFAULT_USER_ID
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
	if (!req.userId) {
		res.status(401).json({ error: 'Authentication required' })
		return
	}
	next()
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

app.post('/api/auth/register', async (req: Request, res: Response) => {
	try {
		const { username, email, password } = req.body as {
			username: string
			email: string
			password: string
		}

		if (!username?.trim() || !email?.trim() || !password) {
			return res.status(400).json({ error: 'All fields are required' })
		}
		if (password.length < 6) {
			return res.status(400).json({ error: 'Password must be at least 6 characters' })
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: 'Invalid email format' })
		}

		const result = await registerUser(username.trim(), email.trim().toLowerCase(), password)
		if (!result) {
			return res.status(409).json({ error: 'Username or email already taken' })
		}

		res.status(201).json(result)
	} catch (err) {
		console.error('[POST /api/auth/register]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/api/auth/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body as { email: string; password: string }
		if (!email?.trim() || !password) {
			return res.status(400).json({ error: 'Email and password are required' })
		}

		const result = await loginUser(email.trim().toLowerCase(), password)
		if (!result) {
			return res.status(401).json({ error: 'Invalid email or password' })
		}

		res.json(result)
	} catch (err) {
		console.error('[POST /api/auth/login]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
	try {
		const profile = await getUserProfile(req.userId!)
		if (!profile) return res.status(404).json({ error: 'User not found' })
		res.json(profile)
	} catch (err) {
		console.error('[GET /api/auth/me]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.put('/api/auth/avatar', requireAuth, async (req: Request, res: Response) => {
	try {
		const { avatar } = req.body as { avatar: string }
		if (!avatar) return res.status(400).json({ error: 'Avatar is required' })
		const user = await updateUserAvatar(req.userId!, avatar)
		res.json(user)
	} catch (err) {
		console.error('[PUT /api/auth/avatar]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Listen History
// ---------------------------------------------------------------------------

app.post('/api/listen-history', requireAuth, async (req: Request, res: Response) => {
	try {
		const { trackName } = req.body as { trackName: string }
		if (!trackName) return res.status(400).json({ error: 'trackName is required' })

		const track = await prisma.track.findFirst({ where: { name: trackName } })
		if (!track) return res.status(404).json({ error: 'Track not found' })

		await addListenRecord(req.userId!, track.id)
		res.json({ ok: true })
	} catch (err) {
		console.error('[POST /api/listen-history]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/api/listen-history', requireAuth, async (req: Request, res: Response) => {
	try {
		const limit = req.query.limit ? Number(req.query.limit) : 50
		const records = await getListenHistory(req.userId!, limit)
		const tracks = records.map(r => ({
			name: r.track.name,
			file: r.track.file,
			cover: r.track.cover,
			duration: r.track.duration,
			explicit: r.track.explicit,
			artistName: r.track.artist.name,
			albumName: r.track.album?.name ?? null,
			playedAt: r.playedAt
		}))
		res.json(tracks)
	} catch (err) {
		console.error('[GET /api/listen-history]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

app.get('/api/tracks', async (req, res) => {
	try {
		const { q, artistId, albumId, limit, offset } = req.query as Record<string, string>
		const tracks = await getTracks({
			q: q || undefined,
			artistId: artistId || undefined,
			albumId: albumId || undefined,
			limit: limit ? Number(limit) : undefined,
			offset: offset ? Number(offset) : undefined
		})
		res.json(tracks)
	} catch (err) {
		console.error('[GET /api/tracks]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/api/tracks/:id', async (req, res) => {
	try {
		const track = await getTrackById(req.params.id)
		if (!track) return res.status(404).json({ error: 'Track not found' })
		res.json(track)
	} catch (err) {
		console.error('[GET /api/tracks/:id]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Lyrics
// ---------------------------------------------------------------------------

app.get('/api/lyrics/by-name/:trackName', async (req, res) => {
	try {
		const trackName = decodeURIComponent(req.params.trackName)
		const lines = await getLyricsByTrackName(trackName)
		if (!lines) return res.status(404).json({ error: 'Lyrics not found' })
		res.json(lines)
	} catch (err) {
		console.error('[GET /api/lyrics/by-name/:trackName]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/api/lyrics/:trackId', async (req, res) => {
	try {
		const lines = await getLyrics(req.params.trackId)
		if (!lines) return res.status(404).json({ error: 'Lyrics not found' })
		res.json(lines)
	} catch (err) {
		console.error('[GET /api/lyrics/:trackId]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Artists
// ---------------------------------------------------------------------------

app.get('/api/artists', async (_req, res) => {
	try {
		res.json(await getArtists())
	} catch (err) {
		console.error('[GET /api/artists]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.get('/api/artists/:name', async (req, res) => {
	try {
		const artist = await getArtistByName(decodeURIComponent(req.params.name))
		if (!artist) return res.status(404).json({ error: 'Artist not found' })
		res.json(artist)
	} catch (err) {
		console.error('[GET /api/artists/:name]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Playlists
// ---------------------------------------------------------------------------

app.get('/api/playlists', async (req, res) => {
	try {
		const userId = getUserId(req)
		res.json(await getPlaylists(userId))
	} catch (err) {
		console.error('[GET /api/playlists]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/api/playlists', async (req, res) => {
	try {
		const userId = getUserId(req)
		const { name } = req.body as { name: string }
		if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
		const playlist = await createPlaylist(userId, name.trim())
		if (!playlist) return res.status(409).json({ error: 'Playlist already exists' })
		res.status(201).json(playlist)
	} catch (err) {
		console.error('[POST /api/playlists]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.put('/api/playlists/:id/rename', async (req, res) => {
	try {
		const userId = getUserId(req)
		const { newName } = req.body as { newName: string }
		if (!newName?.trim()) return res.status(400).json({ error: 'New name is required' })
		const ok = await renamePlaylist(req.params.id, userId, newName.trim())
		if (!ok) return res.status(409).json({ error: 'Name already taken' })
		res.json({ ok })
	} catch (err) {
		console.error('[PUT /api/playlists/:id/rename]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.delete('/api/playlists/:id', async (req, res) => {
	try {
		await deletePlaylist(req.params.id)
		res.json({ ok: true })
	} catch (err) {
		console.error('[DELETE /api/playlists/:id]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.put('/api/playlists/:id/image', async (req, res) => {
	try {
		const { image } = req.body as { image: string }
		if (!image) return res.status(400).json({ error: 'Image is required' })
		await updatePlaylistImage(req.params.id, image)
		res.json({ ok: true })
	} catch (err) {
		console.error('[PUT /api/playlists/:id/image]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.put('/api/playlists/:id/pinned', async (req, res) => {
	try {
		const pinned = await togglePlaylistPinned(req.params.id)
		res.json({ pinned })
	} catch (err) {
		console.error('[PUT /api/playlists/:id/pinned]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/api/playlists/:id/tracks', async (req, res) => {
	try {
		const { trackName } = req.body as { trackName: string }
		if (!trackName) return res.status(400).json({ error: 'trackName is required' })

		const track = await prisma.track.findFirst({ where: { name: trackName } })
		if (!track) return res.status(404).json({ error: 'Track not found' })

		const inPlaylist = await toggleTrackInPlaylist(req.params.id, track.id)
		res.json({ inPlaylist })
	} catch (err) {
		console.error('[POST /api/playlists/:id/tracks]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.put('/api/playlists/:id/reorder', async (req, res) => {
	try {
		const { orderedTrackNames } = req.body as { orderedTrackNames: string[] }
		if (!Array.isArray(orderedTrackNames)) {
			return res.status(400).json({ error: 'orderedTrackNames must be an array' })
		}
		const tracks = await prisma.track.findMany({
			where: { name: { in: orderedTrackNames } },
			select: { id: true, name: true }
		})
		const nameToId = Object.fromEntries(tracks.map(t => [t.name, t.id]))
		const orderedIds = orderedTrackNames
			.map(name => nameToId[name])
			.filter((id): id is string => Boolean(id))

		await reorderPlaylistTracks(req.params.id, orderedIds)
		res.json({ ok: true })
	} catch (err) {
		console.error('[PUT /api/playlists/:id/reorder]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

app.get('/api/favorites/trackNames', async (req, res) => {
	try {
		const userId = getUserId(req)
		res.json(await getFavoriteTrackNames(userId))
	} catch (err) {
		console.error('[GET /api/favorites/trackNames]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/api/favorites/toggle', async (req, res) => {
	try {
		const userId = getUserId(req)
		const { trackName } = req.body as { trackName: string }
		if (!trackName) return res.status(400).json({ error: 'trackName is required' })

		const track = await prisma.track.findFirst({ where: { name: trackName } })
		if (!track) return res.status(404).json({ error: 'Track not found' })

		const isFavorite = await toggleFavorite(userId, track.id)
		res.json({ isFavorite })
	} catch (err) {
		console.error('[POST /api/favorites/toggle]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

app.get('/api/subscriptions', async (req, res) => {
	try {
		const userId = getUserId(req)
		res.json(await getSubscribedArtistNames(userId))
	} catch (err) {
		console.error('[GET /api/subscriptions]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/api/subscriptions/toggle', async (req, res) => {
	try {
		const userId = getUserId(req)
		const { artistName } = req.body as { artistName: string }
		if (!artistName) return res.status(400).json({ error: 'artistName is required' })

		const artist = await prisma.artist.findUnique({ where: { name: artistName } })
		if (!artist) return res.status(404).json({ error: 'Artist not found' })

		const isSubscribed = await toggleSubscription(userId, artist.id)
		res.json({ isSubscribed })
	} catch (err) {
		console.error('[POST /api/subscriptions/toggle]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
	console.log(`API server running at http://localhost:${PORT}`)
})
