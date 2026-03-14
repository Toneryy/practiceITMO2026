import { makeAutoObservable, runInAction } from 'mobx'
import { toast } from 'sonner'
import { authStore, authFetch } from './auth.store'

class SubscriptionStore {
	subscribedNames: string[] = JSON.parse(
		localStorage.getItem('subscribed-artists') || '[]'
	)
	isLoading: boolean = false

	constructor() {
		makeAutoObservable(this)
	}

	async fetchSubscriptions(): Promise<void> {
		this.isLoading = true
		try {
			const userId = authStore.userId
			const res = await authFetch(`/api/subscriptions?userId=${encodeURIComponent(userId)}`)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const names: string[] = await res.json()
			runInAction(() => {
				this.subscribedNames = names
				this.isLoading = false
				localStorage.setItem('subscribed-artists', JSON.stringify(names))
			})
		} catch {
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

		authFetch('/api/subscriptions/toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: authStore.userId, artistName })
		}).catch(() => {})
	}

	isSubscribed(artistName: string) {
		return this.subscribedNames.includes(artistName)
	}
}

export const subscriptionStore = new SubscriptionStore()
