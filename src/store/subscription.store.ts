import { makeAutoObservable, runInAction } from 'mobx'
import { toast } from 'sonner'

export const DEFAULT_USER_ID = 'default-user'

class SubscriptionStore {
	subscribedNames: string[] = JSON.parse(
		localStorage.getItem('subscribed-artists') || '[]'
	)
	isLoading: boolean = false

	constructor() {
		makeAutoObservable(this)
	}

	/**
	 * Sync subscriptions from the database.
	 * Falls back to localStorage if the API is unavailable.
	 */
	async fetchSubscriptions(userId: string = DEFAULT_USER_ID): Promise<void> {
		this.isLoading = true
		try {
			const res = await fetch(`/api/subscriptions?userId=${encodeURIComponent(userId)}`)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const names: string[] = await res.json()
			runInAction(() => {
				this.subscribedNames = names
				this.isLoading = false
				localStorage.setItem('subscribed-artists', JSON.stringify(names))
			})
		} catch {
			// Keep localStorage data as fallback
			runInAction(() => {
				this.isLoading = false
			})
		}
	}

	toggleSubscribe(artistName: string) {
		const wasSubscribed = this.subscribedNames.includes(artistName)
		if (wasSubscribed) {
			this.subscribedNames = this.subscribedNames.filter(
				name => name !== artistName
			)
			toast.success(`Unsubscribed from ${artistName}`)
		} else {
			this.subscribedNames.push(artistName)
			toast.success(`Subscribed to ${artistName}`)
		}
		localStorage.setItem(
			'subscribed-artists',
			JSON.stringify(this.subscribedNames)
		)

		// Persist to DB in background (fire-and-forget)
		fetch('/api/subscriptions/toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: DEFAULT_USER_ID, artistName })
		}).catch(() => {
			// API unavailable – localStorage is the source of truth for now
		})
	}

	isSubscribed(artistName: string) {
		return this.subscribedNames.includes(artistName)
	}
}

export const subscriptionStore = new SubscriptionStore()
