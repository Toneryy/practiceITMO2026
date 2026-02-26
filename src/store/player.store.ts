import { TRACKS } from '@/data/tracks.data'
import type { ITrack } from '@/types/track.types'
import { makeAutoObservable } from 'mobx'

class MusicPlayerStore {
	isPlaying: boolean = false
	currentTrack: ITrack | null = TRACKS[0]
	volume: number = 85
	currentTime: number = 0
	progress: number = 0

	constructor() {
		makeAutoObservable(this)
	}

	setTrack(track: ITrack | null) {
		this.currentTrack = track
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

		const currentIndex = TRACKS.findIndex(
			track => track.name === this.currentTrack?.name
		)

		const nextIndex =
			type === 'next'
				? (currentIndex + 1) % TRACKS.length
				: (currentIndex - 1 + TRACKS.length) % TRACKS.length
		this.setTrack(TRACKS[nextIndex])

		this.currentTime = 0
		this.progress = 0
	}
}

export const playerStore = new MusicPlayerStore()
