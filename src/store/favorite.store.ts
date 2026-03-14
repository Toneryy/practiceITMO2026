import { makeAutoObservable } from 'mobx'
import { toast } from 'sonner'

class FavoriteStore {
	favoritesName: string[] = JSON.parse(
		localStorage.getItem('favorites') || '[]'
	)

	constructor() {
		makeAutoObservable(this)
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
	}
}

export const favoriteStore = new FavoriteStore()
