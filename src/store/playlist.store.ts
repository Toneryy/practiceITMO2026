import { makeAutoObservable } from 'mobx'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'

export interface IPlaylist {
	name: string
	tracks: string[]
	image?: string
}

class PlaylistStore {
	playlists: IPlaylist[] = JSON.parse(
		localStorage.getItem('playlists') || '[]'
	)
	pinnedNames: string[] = JSON.parse(
		localStorage.getItem('playlists-pinned') || '[]'
	)

	constructor() {
		makeAutoObservable(this)
	}

	private saveToLocalStorage() {
		localStorage.setItem('playlists', JSON.stringify(this.playlists))
		localStorage.setItem('playlists-pinned', JSON.stringify(this.pinnedNames))
	}

	createPlaylist(name: string) {
		if (this.playlists.find(playlist => playlist.name === name)) return
		this.playlists.push({ name, tracks: [] })
		this.saveToLocalStorage()
		toast.success('Playlist created')
	}

	renamePlaylist(oldName: string, newName: string) {
		const trimmed = newName.trim()
		if (!trimmed || trimmed === oldName) return
		if (this.playlists.some(p => p.name === trimmed)) return
		const playlist = this.playlists.find(p => p.name === oldName)
		if (!playlist) return
		playlist.name = trimmed
		const idx = this.pinnedNames.indexOf(oldName)
		if (idx !== -1) {
			this.pinnedNames[idx] = trimmed
		}
		this.saveToLocalStorage()
	}

	deletePlaylist(name: string) {
		this.playlists = this.playlists.filter(p => p.name !== name)
		this.pinnedNames = this.pinnedNames.filter(n => n !== name)
		this.saveToLocalStorage()
		toast.success('Playlist deleted')
	}

	updatePlaylistImage(playlistName: string, image: string) {
		const playlist = this.playlists.find(p => p.name === playlistName)
		if (!playlist) return
		playlist.image = image
		this.saveToLocalStorage()
		toast.success('Cover updated')
	}

	togglePinned(name: string) {
		const idx = this.pinnedNames.indexOf(name)
		if (idx === -1) {
			this.pinnedNames.push(name)
		} else {
			this.pinnedNames.splice(idx, 1)
		}
		this.saveToLocalStorage()
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
	}
}

export const playlistStore = new PlaylistStore()
