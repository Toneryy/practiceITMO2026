import type { IArtist } from './artist.types'

export interface ITrack {
	/** Database id — present when data comes from the API, absent on static seed data. */
	id?: string
	name: string
	album: string
	file: string
	artist: IArtist
	duration: number // in seconds
	cover: string
	/** Whether the track contains explicit content. */
	explicit?: boolean
}
