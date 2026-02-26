import type { ITrack } from './track.types'

export interface IArtist {
	name: string
	image: string
	listenersCount: number
	tracks: ITrack[]
}
