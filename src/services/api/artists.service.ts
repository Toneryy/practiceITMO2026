import { prisma } from '../db'
import type { IArtist } from '@/types/artist.types'
import type { ITrack } from '@/types/track.types'

// ---------------------------------------------------------------------------
// Local row shapes — mirror the Prisma query includes so TypeScript has
// concrete types even before `prisma generate` has been run.
// ---------------------------------------------------------------------------

interface ArtistRow {
	id: string
	name: string
	image: string
	listenersCount: number
	bio: string | null
}

interface ArtistWithTracksRow {
	id: string
	name: string
	image: string
	listenersCount: number
	bio: string | null
	tracks: TrackRowWithAlbum[]
}

interface TrackRowWithAlbum {
	id: string
	name: string
	file: string
	cover: string
	duration: number
	album: { id: string; name: string; cover: string } | null
}

/**
 * Returns all artists ordered by name.
 */
export async function getArtists(): Promise<IArtist[]> {
	const rows: ArtistRow[] = await prisma.artist.findMany({
		orderBy: { name: 'asc' }
	})
	return rows.map((r: ArtistRow) => ({
		id: r.id,
		name: r.name,
		image: r.image,
		listenersCount: r.listenersCount,
		bio: r.bio,
		tracks: []
	}))
}

/**
 * Returns a single artist with their full track list.
 */
export async function getArtistByName(name: string): Promise<IArtist | null> {
	const row = (await prisma.artist.findUnique({
		where: { name },
		include: {
			tracks: {
				include: { album: true }
			}
		}
	})) as ArtistWithTracksRow | null

	if (!row) return null

	const artistBase: Omit<IArtist, 'tracks'> = {
		id: row.id,
		name: row.name,
		image: row.image,
		listenersCount: row.listenersCount,
		bio: row.bio
	}

	const tracks: ITrack[] = row.tracks.map((t: TrackRowWithAlbum) => ({
		id: t.id,
		name: t.name,
		file: t.file,
		cover: t.cover,
		duration: t.duration,
		album: t.album?.name ?? '',
		artist: { ...artistBase, tracks: [] }
	}))

	return { ...artistBase, tracks }
}
