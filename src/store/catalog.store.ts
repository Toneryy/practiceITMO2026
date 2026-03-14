import { makeAutoObservable, runInAction } from 'mobx'
import type { ITrack } from '@/types/track.types'
import type { IArtist } from '@/types/artist.types'

class CatalogStore {
	tracks: ITrack[] = []
	artists: IArtist[] = []
	currentArtist: IArtist | null = null

	isLoaded: boolean = false
	isLoadingTracks: boolean = false
	isLoadingArtists: boolean = false
	isLoadingArtist: boolean = false
	tracksError: string | null = null
	artistsError: string | null = null
	artistError: string | null = null

	constructor() {
		makeAutoObservable(this)
	}

	// ---------------------------------------------------------------------------
	// Derived helpers
	// ---------------------------------------------------------------------------

	/** Map of album name → representative track (for cover/artist info). */
	get albums(): Map<string, ITrack> {
		const map = new Map<string, ITrack>()
		for (const track of this.tracks) {
			if (!map.has(track.album)) map.set(track.album, track)
		}
		return map
	}

	/** Tracks whose names are in the given list — used by LikedSongsPage / PlaylistPage. */
	tracksByNames(names: string[]): ITrack[] {
		const set = new Set(names)
		return this.tracks.filter(t => set.has(t.name))
	}

	/** Tracks belonging to a specific album. */
	tracksByAlbum(albumName: string): ITrack[] {
		return this.tracks.filter(t => t.album === albumName)
	}

	/** Filter tracks by search term (name or artist). */
	filterTracks(term: string): ITrack[] {
		const q = term.trim().toLowerCase()
		if (!q) return this.tracks
		return this.tracks.filter(
			t =>
				t.name.toLowerCase().includes(q) ||
				t.artist.name.toLowerCase().includes(q)
		)
	}

	// ---------------------------------------------------------------------------
	// Data fetching
	// ---------------------------------------------------------------------------

	async fetchTracks(): Promise<void> {
		this.isLoadingTracks = true
		this.tracksError = null
		try {
			const res = await fetch('/api/tracks')
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data = await res.json()
			const tracks = Array.isArray(data) ? data : []
			runInAction(() => {
				this.tracks = tracks
				this.isLoadingTracks = false

				// Initialize the player with the first track if it has nothing loaded yet.
				// Import is deferred to avoid a circular dependency at module load time.
				import('./player.store').then(({ playerStore }) => {
					if (!playerStore.currentTrack && tracks.length > 0) {
						playerStore.setTrack(tracks[0], tracks)
					}
				})
			})
		} catch (err) {
			runInAction(() => {
				this.isLoadingTracks = false
				this.tracksError = err instanceof Error ? err.message : 'Unknown error'
			})
		}
	}

	async fetchArtists(): Promise<void> {
		this.isLoadingArtists = true
		this.artistsError = null
		try {
			const res = await fetch('/api/artists')
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data = await res.json()
			const artists = Array.isArray(data) ? data : []
			runInAction(() => {
				this.artists = artists
				this.isLoadingArtists = false
			})
		} catch (err) {
			runInAction(() => {
				this.isLoadingArtists = false
				this.artistsError = err instanceof Error ? err.message : 'Unknown error'
			})
		}
	}

	/** Fetch a single artist with their full track list. Sets `currentArtist`. */
	async fetchArtistByName(name: string): Promise<void> {
		this.isLoadingArtist = true
		this.artistError = null
		this.currentArtist = null
		try {
			const res = await fetch(`/api/artists/${encodeURIComponent(name)}`)
			if (res.status === 404) {
				runInAction(() => {
					this.currentArtist = null
					this.isLoadingArtist = false
				})
				return
			}
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data: IArtist = await res.json()
			runInAction(() => {
				this.currentArtist = data
				this.isLoadingArtist = false
			})
		} catch (err) {
			runInAction(() => {
				this.isLoadingArtist = false
				this.artistError = err instanceof Error ? err.message : 'Unknown error'
			})
		}
	}

	/**
	 * Load tracks and artists in parallel.
	 * Skips the fetch if data is already loaded (e.g. on HMR restarts).
	 */
	async fetchAll(): Promise<void> {
		if (this.isLoaded) return
		this.isLoaded = true
		await Promise.all([this.fetchTracks(), this.fetchArtists()])
	}
}

export const catalogStore = new CatalogStore()
