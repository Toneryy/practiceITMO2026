import { TRACKS } from '@/data/tracks.data'
import type { ITrack } from '@/types/track.types'
import { makeAutoObservable } from 'mobx'

class MusicPlayerStore {
	isPlaying: boolean = false
	currentTrack: ITrack | null = TRACKS[0]
	queue: ITrack[] = []
	volume: number = 85
	currentTime: number = 0
	progress: number = 0
	recentTracks: ITrack[] = []

	constructor() {
		makeAutoObservable(this)
	}

	addRecentTrack(track: ITrack) {
		this.recentTracks = [
			track,
			...this.recentTracks.filter(t => t.name !== track.name)
		].slice(0, 20)
	}

	setTrack(track: ITrack | null, newQueue?: ITrack[]) {
		if (newQueue !== undefined) {
			this.queue = newQueue
		}
		this.currentTrack = track
		if (track) {
			this.addRecentTrack(track)
		}
	}

	togglePlayPause() {
		this.isPlaying = !this.isPlaying
	}

	play() {
		this.isPlaying = true
	}

	pause() {
		this.isPlaying = false
	}

	seek(time: number) {
		this.currentTime = time
		this.progress = (time / (this.currentTrack?.duration || 1)) * 100
	}

	setVolume(volume: number) {
		this.volume = volume
	}

	changeTrack(type: 'prev' | 'next') {
		if (!this.currentTrack) return

		// Use queue when set (e.g. from album/playlist), otherwise fallback to TRACKS
		const list = this.queue.length > 0 ? this.queue : TRACKS
		const currentIndex = list.findIndex(
			t => t.name === this.currentTrack?.name
		)
		if (currentIndex === -1) return

		const nextIndex =
			type === 'next'
				? (currentIndex + 1) % list.length
				: (currentIndex - 1 + list.length) % list.length
		this.setTrack(list[nextIndex])
		this.currentTime = 0
		this.progress = 0
	}
}

export const playerStore = new MusicPlayerStore()
