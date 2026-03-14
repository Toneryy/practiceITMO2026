import { makeAutoObservable, runInAction } from 'mobx'
import { toast } from 'sonner'
import { authStore, authFetch } from './auth.store'

class FavoriteStore {
	favoritesName: string[] = JSON.parse(
		localStorage.getItem('favorites') || '[]'
	)
	isLoading: boolean = false

	constructor() {
		makeAutoObservable(this)
	}

	async fetchFavorites(): Promise<void> {
		this.isLoading = true
		try {
			const userId = authStore.userId
			const res = await authFetch(`/api/favorites/trackNames?userId=${encodeURIComponent(userId)}`)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const names: string[] = await res.json()
			runInAction(() => {
				this.favoritesName = names
				this.isLoading = false
				localStorage.setItem('favorites', JSON.stringify(names))
			})
		} catch {
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

		authFetch('/api/favorites/toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: authStore.userId, trackName })
		}).catch(() => {})
	}
}

export const favoriteStore = new FavoriteStore()
