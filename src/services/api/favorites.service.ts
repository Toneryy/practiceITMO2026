import { prisma } from '../db'

// ---------------------------------------------------------------------------
// Local row shapes — mirror the Prisma query includes.
// ---------------------------------------------------------------------------

interface FavoriteIdRow {
	trackId: string
}

interface FavoriteNameRow {
	track: { name: string }
}

/**
 * Returns the list of track ids the user has favourited.
 */
export async function getFavoriteTrackIds(userId: string): Promise<string[]> {
	const rows: FavoriteIdRow[] = await prisma.userFavorite.findMany({
		where: { userId },
		select: { trackId: true }
	})
	return rows.map((r: FavoriteIdRow) => r.trackId)
}

/**
 * Returns the list of track *names* the user has favourited.
 * Kept alongside `getFavoriteTrackIds` because the current FavoriteStore
 * stores and compares names; this makes the transition zero-diff for components.
 */
export async function getFavoriteTrackNames(userId: string): Promise<string[]> {
	const rows: FavoriteNameRow[] = await prisma.userFavorite.findMany({
		where: { userId },
		include: { track: { select: { name: true } } }
	})
	return rows.map((r: FavoriteNameRow) => r.track.name)
}

/**
 * Toggles a track in the user's favourites (add if absent, remove if present).
 * Returns `true` when the track is now in favourites, `false` when removed.
 */
export async function toggleFavorite(userId: string, trackId: string): Promise<boolean> {
	const existing = await prisma.userFavorite.findUnique({
		where: { userId_trackId: { userId, trackId } }
	})

	if (existing) {
		await prisma.userFavorite.delete({ where: { id: existing.id } })
		return false
	}

	await prisma.userFavorite.create({ data: { userId, trackId } })
	return true
}
