import { prisma } from '../db'
import type { LyricsLine } from '@/types/lyrics.types'

/**
 * Returns the lyrics lines for a given track id, or null when not found.
 * The `lines` column is stored as a JSON string of LyricsLine[].
 * Validates that parsed data is a non-empty array of valid line objects.
 */
export async function getLyrics(trackId: string): Promise<LyricsLine[] | null> {
	const row = await prisma.lyrics.findUnique({ where: { trackId } })
	if (!row) return null
	try {
		const parsed = JSON.parse(row.lines)
		if (!Array.isArray(parsed) || parsed.length === 0) return null
		// Ensure each item has required fields
		const lines = parsed.filter(
			(item: unknown): item is LyricsLine =>
				typeof item === 'object' &&
				item !== null &&
				typeof (item as LyricsLine).time === 'number' &&
				typeof (item as LyricsLine).text === 'string'
		)
		return lines.length > 0 ? lines : null
	} catch {
		return null
	}
}

/**
 * Returns lyrics by track name. Looks up the track first, then fetches lyrics.
 * Useful when frontend only has track name (e.g. from playlist).
 */
export async function getLyricsByTrackName(
	trackName: string
): Promise<LyricsLine[] | null> {
	const track = await prisma.track.findFirst({
		where: { name: trackName },
		select: { id: true }
	})
	if (!track) return null
	return getLyrics(track.id)
}
