import { prisma } from '../db'
import type { ITrack } from '@/types/track.types'

export interface GetTracksParams {
	q?: string
	artistId?: string
	albumId?: string
	limit?: number
	offset?: number
}

/**
 * Returns tracks from the database with optional filters.
 * Results are mapped to the existing ITrack shape so components
 * continue working without changes.
 */
export async function getTracks(params: GetTracksParams = {}): Promise<ITrack[]> {
	const { q, artistId, albumId, limit, offset } = params

	const rows = await prisma.track.findMany({
		where: {
			...(artistId ? { artistId } : {}),
			...(albumId ? { albumId } : {}),
			...(q
				? {
						OR: [
							{ name: { contains: q } },
							{ artist: { name: { contains: q } } }
						]
					}
				: {})
		},
		include: {
			artist: true,
			album: true
		},
		orderBy: { name: 'asc' },
		...(limit !== undefined ? { take: limit } : {}),
		...(offset !== undefined ? { skip: offset } : {})
	})

	return rows.map(dbTrackToITrack)
}

/**
 * Returns a single track by its database id.
 */
export async function getTrackById(id: string): Promise<ITrack | null> {
	const row = await prisma.track.findUnique({
		where: { id },
		include: { artist: true, album: true }
	})
	return row ? dbTrackToITrack(row) : null
}

// ---------------------------------------------------------------------------
// Shape mapping
// ---------------------------------------------------------------------------

type TrackRow = Awaited<ReturnType<typeof prisma.track.findMany>>[number] & {
	explicit: boolean
	artist: { id: string; name: string; image: string; listenersCount: number }
	album: { id: string; name: string; cover: string } | null
}

function dbTrackToITrack(row: TrackRow): ITrack {
	return {
		id: row.id,
		name: row.name,
		file: row.file,
		cover: row.cover,
		duration: row.duration,
		explicit: row.explicit,
		album: row.album?.name ?? '',
		artist: {
			id: row.artist.id,
			name: row.artist.name,
			image: row.artist.image,
			listenersCount: row.artist.listenersCount,
			tracks: []
		}
	}
}
