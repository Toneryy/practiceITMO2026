import { makeAutoObservable } from 'mobx'
import { toast } from 'sonner'

class SubscriptionStore {
	subscribedNames: string[] = JSON.parse(
		localStorage.getItem('subscribed-artists') || '[]'
	)

	constructor() {
		makeAutoObservable(this)
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
	}

	isSubscribed(artistName: string) {
		return this.subscribedNames.includes(artistName)
	}
}

export const subscriptionStore = new SubscriptionStore()
