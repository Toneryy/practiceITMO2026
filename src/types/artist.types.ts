import type { ITrack } from './track.types'

export interface IArtist {
	/** Database id — present when data comes from the API, absent on static seed data. */
	id?: string
	name: string
	image: string
	listenersCount: number
	tracks: ITrack[]
}
