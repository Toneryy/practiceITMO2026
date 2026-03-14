import cors from 'cors'
import express from 'express'
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

const PORT = 3001
const DEFAULT_USER_ID = 'default-user'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' })) // 10 mb for base64 cover images

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
		const userId = (req.query.userId as string) || DEFAULT_USER_ID
		res.json(await getPlaylists(userId))
	} catch (err) {
		console.error('[GET /api/playlists]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

app.post('/api/playlists', async (req, res) => {
	try {
		const { userId = DEFAULT_USER_ID, name } = req.body as { userId?: string; name: string }
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
		const { userId = DEFAULT_USER_ID, newName } = req.body as { userId?: string; newName: string }
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

// body: { trackName: string } — accepts name so the frontend doesn't need to know IDs yet
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

// body: { orderedTrackNames: string[] }
app.put('/api/playlists/:id/reorder', async (req, res) => {
	try {
		const { orderedTrackNames } = req.body as { orderedTrackNames: string[] }
		if (!Array.isArray(orderedTrackNames)) {
			return res.status(400).json({ error: 'orderedTrackNames must be an array' })
		}
		// Resolve names → IDs in order
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

// Returns track names (not IDs) — matches FavoriteStore.favoritesName shape
app.get('/api/favorites/trackNames', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || DEFAULT_USER_ID
		res.json(await getFavoriteTrackNames(userId))
	} catch (err) {
		console.error('[GET /api/favorites/trackNames]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// body: { userId?: string, trackName: string }
app.post('/api/favorites/toggle', async (req, res) => {
	try {
		const { userId = DEFAULT_USER_ID, trackName } = req.body as {
			userId?: string
			trackName: string
		}
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

// Returns artist names — matches SubscriptionStore.subscribedNames shape
app.get('/api/subscriptions', async (req, res) => {
	try {
		const userId = (req.query.userId as string) || DEFAULT_USER_ID
		res.json(await getSubscribedArtistNames(userId))
	} catch (err) {
		console.error('[GET /api/subscriptions]', err)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// body: { userId?: string, artistName: string }
app.post('/api/subscriptions/toggle', async (req, res) => {
	try {
		const { userId = DEFAULT_USER_ID, artistName } = req.body as {
			userId?: string
			artistName: string
		}
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
