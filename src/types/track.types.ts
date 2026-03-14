import type { IArtist } from './artist.types'

export interface ITrack {
	name: string
	album: string
	file: string
	artist: IArtist
	duration: number // in seconds
	cover: string
}
