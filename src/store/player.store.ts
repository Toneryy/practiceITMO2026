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
	queueOpen: boolean = false
	fullscreenOpen: boolean = false
	seekRequest: number | null = null
	currentTime: number = 0
	progress: number = 0
	recentTracks: ITrack[] = []

	/** Actual tracks in the queue panel — never falls back to TRACKS */
	get queueList(): ITrack[] {
		return this.queue
	}

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
			this.queue = this.isShuffle ? this.shuffled(newQueue) : [...newQueue]
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

	toggleFullscreen() {
		this.fullscreenOpen = !this.fullscreenOpen
	}

	toggleLyrics() {
		if (!this.lyricsOpen) {
			this.queueOpen = false
		}
		this.lyricsOpen = !this.lyricsOpen
	}

	toggleQueue() {
		if (!this.queueOpen) {
			this.lyricsOpen = false
		}
		this.queueOpen = !this.queueOpen
	}

	playFromQueue(index: number) {
		const track = this.queue[index]
		if (!track) return
		this.setTrack(track)
		this.currentTime = 0
		this.progress = 0
		this.isPlaying = true
	}

	private shuffled(arr: ITrack[]): ITrack[] {
		return [...arr].sort(() => Math.random() - 0.5)
	}

	toggleShuffle() {
		this.isShuffle = !this.isShuffle
		if (this.queue.length === 0) return
		if (this.isShuffle) {
			const current = this.currentTrack
			const rest = this.originalQueue.filter(t => t.name !== current?.name)
			this.queue = current
				? [current, ...this.shuffled(rest)]
				: this.shuffled(this.originalQueue)
		} else {
			this.queue = [...this.originalQueue]
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

		// No queue context — stop on next, allow restarting from beginning on prev
		if (this.queue.length === 0) {
			if (type === 'next') this.isPlaying = false
			return
		}

		const currentIndex = this.queue.findIndex(
			t => t.name === this.currentTrack?.name
		)

		if (type === 'next') {
			const isLast = currentIndex === -1 || currentIndex === this.queue.length - 1
			if (isLast) {
				if (this.repeatMode === 'all') {
					// wrap to beginning
					this.setTrack(this.queue[0])
				} else {
					// repeatMode 'none' — stop
					this.isPlaying = false
					return
				}
			} else {
				this.setTrack(this.queue[currentIndex + 1])
			}
		} else {
			// prev
			const prevIndex = Math.max(0, currentIndex <= 0 ? 0 : currentIndex - 1)
			this.setTrack(this.queue[prevIndex])
		}

		this.currentTime = 0
		this.progress = 0
		this.isPlaying = true
	}

	/**
	 * Add a track to the end of the queue.
	 * If the queue is empty but there's a current track, initialize
	 * the queue starting from the current track.
	 */
	removeFromQueue(trackName: string) {
		this.queue = this.queue.filter(t => t.name !== trackName)
		this.originalQueue = this.originalQueue.filter(t => t.name !== trackName)
	}

	addToQueue(track: ITrack) {
		if (this.queue.length === 0 && this.currentTrack) {
			const initial: ITrack[] = [this.currentTrack]
			if (track.name !== this.currentTrack.name) initial.push(track)
			this.originalQueue = [...initial]
			this.queue = [...initial]
			return
		}
		if (this.queue.some(t => t.name === track.name)) return
		this.queue = [...this.queue, track]
		this.originalQueue = [...this.originalQueue, track]
	}

	/**
	 * Insert a track right after the current track in the queue.
	 * If the queue is empty but there's a current track, create a
	 * two-item queue: [current, track].
	 */
	playNext(track: ITrack) {
		if (this.queue.length === 0) {
			if (this.currentTrack) {
				const initial: ITrack[] = [this.currentTrack]
				if (track.name !== this.currentTrack.name) initial.push(track)
				this.originalQueue = [...initial]
				this.queue = [...initial]
			} else {
				this.originalQueue = [track]
				this.queue = [track]
			}
			return
		}

		const currentIndex = this.queue.findIndex(
			t => t.name === this.currentTrack?.name
		)
		const insertIndex = currentIndex === -1 ? this.queue.length : currentIndex + 1

		// Remove the track from its current position if already queued
		const filteredQueue = this.queue.filter(t => t.name !== track.name)
		const filteredOrig = this.originalQueue.filter(t => t.name !== track.name)

		// Recalculate insertIndex after removal to keep it correct.
		// Only shrink the index if the track was actually found before insertIndex.
		const foundIndex = this.queue.findIndex(t => t.name === track.name)
		const wasBeforeInsert = foundIndex !== -1 && foundIndex < insertIndex
		const adjustedIndex = wasBeforeInsert
			? Math.max(0, insertIndex - 1)
			: insertIndex

		this.queue = [
			...filteredQueue.slice(0, adjustedIndex),
			track,
			...filteredQueue.slice(adjustedIndex),
		]
		this.originalQueue = [
			...filteredOrig.slice(0, adjustedIndex),
			track,
			...filteredOrig.slice(adjustedIndex),
		]
	}
}

export const playerStore = new MusicPlayerStore()
