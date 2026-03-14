import { TRACKS } from '@/data/tracks.data'
import type { ITrack } from '@/types/track.types'
import { makeAutoObservable } from 'mobx'

export type RepeatMode = 'none' | 'all' | 'one'

class MusicPlayerStore {
	isPlaying: boolean = false
	currentTrack: ITrack | null = TRACKS[0]
	queue: ITrack[] = []
	originalQueue: ITrack[] = []
	isShuffle: boolean = false
	repeatMode: RepeatMode = 'all'
	volume: number = 85
	lyricsOpen: boolean = true
	seekRequest: number | null = null
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
			this.originalQueue = [...newQueue]
			this.queue = this.isShuffle ? this.shuffled(newQueue) : newQueue
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

	toggleLyrics() {
		this.lyricsOpen = !this.lyricsOpen
	}

	private shuffled(arr: ITrack[]): ITrack[] {
		return [...arr].sort(() => Math.random() - 0.5)
	}

	toggleShuffle() {
		this.isShuffle = !this.isShuffle
		if (this.isShuffle) {
			this.queue = this.shuffled(
				this.originalQueue.length > 0 ? this.originalQueue : TRACKS
			)
		} else {
			this.queue =
				this.originalQueue.length > 0 ? [...this.originalQueue] : [...TRACKS]
		}
	}

	toggleRepeat() {
		const order: RepeatMode[] = ['none', 'all', 'one']
		const idx = order.indexOf(this.repeatMode)
		this.repeatMode = order[(idx + 1) % order.length]
	}

	requestSeek(time: number) {
		this.seek(time)
		this.seekRequest = time
	}

	clearSeekRequest() {
		this.seekRequest = null
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
		this.isPlaying = true
	}

	addToQueue(track: ITrack) {
		if (this.queue.some(t => t.name === track.name)) return
		this.queue = [...this.queue, track]
		this.originalQueue = [...this.originalQueue, track]
	}

	playNext(track: ITrack) {
		const list = this.queue.length > 0 ? this.queue : TRACKS
		const currentIndex = list.findIndex(
			t => t.name === this.currentTrack?.name
		)
		const insertIndex = currentIndex === -1 ? 0 : currentIndex + 1
		const filtered = this.queue.filter(t => t.name !== track.name)
		const nextQueue = [
			...filtered.slice(0, insertIndex),
			track,
			...filtered.slice(insertIndex)
		]
		this.queue = nextQueue
		const origFiltered = this.originalQueue.filter(t => t.name !== track.name)
		this.originalQueue = [
			...origFiltered.slice(0, insertIndex),
			track,
			...origFiltered.slice(insertIndex)
		]
	}
}

export const playerStore = new MusicPlayerStore()
