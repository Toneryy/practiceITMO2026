import { prisma } from '../db'
import type { IPlaylist } from '@/store/playlist.store'

export interface PlaylistWithTracks extends IPlaylist {
	id: string
	pinned: boolean
}

// ---------------------------------------------------------------------------
// Local row shapes — mirror the Prisma query includes.
// ---------------------------------------------------------------------------

interface PlaylistTrackRow {
	track: { name: string }
}

interface PlaylistRow {
	id: string
	name: string
	image: string | null
	pinned: boolean
	order: number
	tracks: PlaylistTrackRow[]
}

/**
 * Returns all playlists for the given user, ordered by pinned status and
 * insertion order, with the track name list resolved.
 */
export async function getPlaylists(userId: string): Promise<PlaylistWithTracks[]> {
	const rows: PlaylistRow[] = await prisma.playlist.findMany({
		where: { userId },
		orderBy: [{ pinned: 'desc' }, { order: 'asc' }],
		include: {
			tracks: {
				orderBy: { order: 'asc' },
				include: { track: true }
			}
		}
	})

	return rows.map((row: PlaylistRow) => ({
		id: row.id,
		name: row.name,
		image: row.image ?? undefined,
		pinned: row.pinned,
		// Keep the same shape as the current IPlaylist: string[] of track names.
		// Components rely on track names for look-up in TRACKS until fully migrated.
		tracks: row.tracks.map((pt: PlaylistTrackRow) => pt.track.name)
	}))
}

/**
 * Creates a new playlist. Returns null if a playlist with the same name
 * already exists for this user.
 */
export async function createPlaylist(
	userId: string,
	name: string
): Promise<PlaylistWithTracks | null> {
	const exists = await prisma.playlist.findUnique({
		where: { name_userId: { name, userId } }
	})
	if (exists) return null

	const created = await prisma.playlist.create({
		data: { name, userId },
		include: { tracks: true }
	})

	return { id: created.id, name: created.name, tracks: [], pinned: false, image: undefined }
}

/**
 * Renames a playlist. Returns false if the name is already taken.
 */
export async function renamePlaylist(
	playlistId: string,
	userId: string,
	newName: string
): Promise<boolean> {
	const conflict = await prisma.playlist.findUnique({
		where: { name_userId: { name: newName, userId } }
	})
	if (conflict && conflict.id !== playlistId) return false

	await prisma.playlist.update({
		where: { id: playlistId },
		data: { name: newName }
	})
	return true
}

/**
 * Deletes a playlist (cascade removes PlaylistTrack rows).
 */
export async function deletePlaylist(playlistId: string): Promise<void> {
	await prisma.playlist.delete({ where: { id: playlistId } })
}

/**
 * Updates the cover image (base-64 data URL or file path).
 */
export async function updatePlaylistImage(
	playlistId: string,
	image: string
): Promise<void> {
	await prisma.playlist.update({ where: { id: playlistId }, data: { image } })
}

/**
 * Toggles the pinned flag. Returns the new pinned state.
 */
export async function togglePlaylistPinned(playlistId: string): Promise<boolean> {
	const current = await prisma.playlist.findUnique({
		where: { id: playlistId },
		select: { pinned: true }
	})
	const next = !current?.pinned
	await prisma.playlist.update({
		where: { id: playlistId },
		data: { pinned: next }
	})
	return next
}

/**
 * Adds or removes a track from a playlist (toggle semantics, matching the
 * current store behaviour). Returns whether the track is now in the playlist.
 */
export async function toggleTrackInPlaylist(
	playlistId: string,
	trackId: string
): Promise<boolean> {
	const existing = await prisma.playlistTrack.findUnique({
		where: { playlistId_trackId: { playlistId, trackId } }
	})

	if (existing) {
		await prisma.playlistTrack.delete({ where: { id: existing.id } })
		return false
	}

	// Append at the end: derive order from current count.
	const count = await prisma.playlistTrack.count({ where: { playlistId } })
	await prisma.playlistTrack.create({
		data: { playlistId, trackId, order: count }
	})
	return true
}

/**
 * Persists a reordered track list. Accepts the new ordered array of trackIds.
 */
export async function reorderPlaylistTracks(
	playlistId: string,
	orderedTrackIds: string[]
): Promise<void> {
	await prisma.$transaction(
		orderedTrackIds.map((trackId: string, index: number) =>
			prisma.playlistTrack.update({
				where: { playlistId_trackId: { playlistId, trackId } },
				data: { order: index }
			})
		)
	)
}
