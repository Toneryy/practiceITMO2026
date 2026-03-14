import { makeAutoObservable, runInAction } from 'mobx'
import { toast } from 'sonner'

export const DEFAULT_USER_ID = 'default-user'

class FavoriteStore {
	favoritesName: string[] = JSON.parse(
		localStorage.getItem('favorites') || '[]'
	)
	isLoading: boolean = false

	constructor() {
		makeAutoObservable(this)
	}

	/**
	 * Sync the favorites list from the database.
	 * Falls back to localStorage if the API is unavailable.
	 */
	async fetchFavorites(userId: string = DEFAULT_USER_ID): Promise<void> {
		this.isLoading = true
		try {
			const res = await fetch(`/api/favorites/trackNames?userId=${encodeURIComponent(userId)}`)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const names: string[] = await res.json()
			runInAction(() => {
				this.favoritesName = names
				this.isLoading = false
				localStorage.setItem('favorites', JSON.stringify(names))
			})
		} catch {
			// Keep localStorage data as fallback
			runInAction(() => {
				this.isLoading = false
			})
		}
	}

	toggleFavorite(trackName: string) {
		const wasIn = this.favoritesName.includes(trackName)
		if (wasIn) {
			this.favoritesName = this.favoritesName.filter(name => name !== trackName)
		} else {
			this.favoritesName.push(trackName)
		}
		localStorage.setItem('favorites', JSON.stringify(this.favoritesName))
		toast.success(wasIn ? 'Removed from Favorites' : 'Added to Favorites')

		// Persist to DB in background (fire-and-forget)
		fetch('/api/favorites/toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: DEFAULT_USER_ID, trackName })
		}).catch(() => {
			// API unavailable – localStorage is the source of truth for now
		})
	}
}

export const favoriteStore = new FavoriteStore()
