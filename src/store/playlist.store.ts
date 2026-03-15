import { makeAutoObservable, runInAction } from 'mobx'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { authStore, authFetch } from './auth.store'

export interface IPlaylist {
	id?: string
	name: string
	tracks: string[]
	image?: string
	pinned?: boolean
}

class PlaylistStore {
	playlists: IPlaylist[] = JSON.parse(
		localStorage.getItem('playlists') || '[]'
	)
	pinnedNames: string[] = JSON.parse(
		localStorage.getItem('playlists-pinned') || '[]'
	)

	isLoading: boolean = false
	error: string | null = null

	constructor() {
		makeAutoObservable(this)
	}

	async fetchPlaylists(): Promise<void> {
		this.isLoading = true
		this.error = null
		try {
			const userId = authStore.userId
			const res = await authFetch(`/api/playlists?userId=${userId}`)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data: IPlaylist[] = await res.json()
			runInAction(() => {
				this.playlists = data
				this.pinnedNames = data.filter(p => p.pinned).map(p => p.name)
				this.isLoading = false
				this.saveToLocalStorage()
			})
		} catch (err) {
			runInAction(() => {
				this.isLoading = false
				this.error = err instanceof Error ? err.message : 'Unknown error'
			})
		}
	}

	private saveToLocalStorage() {
		localStorage.setItem('playlists', JSON.stringify(this.playlists))
		localStorage.setItem('playlists-pinned', JSON.stringify(this.pinnedNames))
	}

	async createPlaylist(name: string): Promise<boolean> {
		if (this.playlists.find(playlist => playlist.name === name)) return false
		
		try {
			const res = await authFetch('/api/playlists', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: authStore.userId, name })
			})
			
			if (!res.ok) return false
			const created = await res.json()
			
			runInAction(() => {
				this.playlists.push({
					id: created.id,
					name: created.name,
					tracks: [],
					pinned: false
				})
				this.saveToLocalStorage()
			})
			
			toast.success('Playlist created')
			return true
		} catch {
			toast.error('Failed to create playlist')
			return false
		}
	}

	renamePlaylist(oldName: string, newName: string) {
		const trimmed = newName.trim()
		if (!trimmed || trimmed === oldName) return
		if (this.playlists.some(p => p.name === trimmed)) return
		const playlist = this.playlists.find(p => p.name === oldName)
		if (!playlist) return

		const playlistId = playlist.id
		playlist.name = trimmed
		const idx = this.pinnedNames.indexOf(oldName)
		if (idx !== -1) this.pinnedNames[idx] = trimmed
		this.saveToLocalStorage()

		if (playlistId) {
			authFetch(`/api/playlists/${playlistId}/rename`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: authStore.userId, newName: trimmed })
			}).catch(() => {})
		}
	}

	deletePlaylist(name: string) {
		const playlist = this.playlists.find(p => p.name === name)
		const playlistId = playlist?.id

		this.playlists = this.playlists.filter(p => p.name !== name)
		this.pinnedNames = this.pinnedNames.filter(n => n !== name)
		this.saveToLocalStorage()
		toast.success('Playlist deleted')

		if (playlistId) {
			authFetch(`/api/playlists/${playlistId}`, { method: 'DELETE' }).catch(() => {})
		}
	}

	updatePlaylistImage(playlistName: string, image: string) {
		const playlist = this.playlists.find(p => p.name === playlistName)
		if (!playlist) return
		playlist.image = image
		this.saveToLocalStorage()
		toast.success('Cover updated')

		if (playlist.id) {
			authFetch(`/api/playlists/${playlist.id}/image`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ image })
			}).catch(() => {})
		}
	}

	togglePinned(name: string) {
		const idx = this.pinnedNames.indexOf(name)
		if (idx === -1) {
			this.pinnedNames.push(name)
		} else {
			this.pinnedNames.splice(idx, 1)
		}
		const playlist = this.playlists.find(p => p.name === name)
		if (playlist) playlist.pinned = idx === -1
		this.saveToLocalStorage()

		if (playlist?.id) {
			authFetch(`/api/playlists/${playlist.id}/pinned`, { method: 'PUT' }).catch(() => {})
		}
	}

	isPinned(name: string) {
		return this.pinnedNames.includes(name)
	}

	get sortedPlaylists() {
		return [...this.playlists].sort((a, b) => {
			const aPin = this.pinnedNames.indexOf(a.name)
			const bPin = this.pinnedNames.indexOf(b.name)
			if (aPin !== -1 && bPin === -1) return -1
			if (aPin === -1 && bPin !== -1) return 1
			if (aPin !== -1 && bPin !== -1) return aPin - bPin
			return this.playlists.indexOf(a) - this.playlists.indexOf(b)
		})
	}

	toggleTrackInPlaylist(playlistName: string, trackName: string) {
		const playlist = this.playlists.find(p => p.name === playlistName)
		if (!playlist) return
		const wasIn = playlist.tracks.includes(trackName)
		if (wasIn) {
			playlist.tracks = playlist.tracks.filter(name => name !== trackName)
		} else {
			playlist.tracks.push(trackName)
		}
		this.saveToLocalStorage()
		toast.success(
			wasIn
				? `Track removed from ${playlistName}`
				: `Track added to ${playlistName}`
		)

		if (playlist.id) {
			authFetch(`/api/playlists/${playlist.id}/tracks`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ trackName })
			}).catch(() => {})
		}
	}

	isTrackInPlaylist(playlistName: string, trackName: string) {
		const playlist = this.playlists.find(p => p.name === playlistName)
		if (!playlist) return false
		return playlist.tracks.includes(trackName)
	}

	reorderTracks(playlistName: string, oldIndex: number, newIndex: number) {
		const playlist = this.playlists.find(p => p.name === playlistName)
		if (!playlist) return
		if (
			oldIndex < 0 ||
			newIndex < 0 ||
			oldIndex >= playlist.tracks.length ||
			newIndex >= playlist.tracks.length ||
			oldIndex === newIndex
		) {
			return
		}
		playlist.tracks = arrayMove(playlist.tracks, oldIndex, newIndex)
		this.saveToLocalStorage()
		toast.success('Order updated')

		if (playlist.id) {
			authFetch(`/api/playlists/${playlist.id}/reorder`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderedTrackNames: playlist.tracks })
			}).catch(() => {})
		}
	}
}

export const playlistStore = new PlaylistStore()
