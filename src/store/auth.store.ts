import { makeAutoObservable, runInAction } from 'mobx'

export interface IUser {
	id: string
	username: string
	email: string
	avatar: string | null
	createdAt: string
	_count?: {
		favorites: number
		playlists: number
		subscriptions: number
		listenHistory: number
	}
}

class AuthStore {
	user: IUser | null = null
	token: string | null = localStorage.getItem('auth-token')
	isLoading = true
	error: string | null = null

	constructor() {
		makeAutoObservable(this)
		if (this.token) {
			this.fetchMe()
		} else {
			this.isLoading = false
		}
	}

	get isAuthenticated() {
		return !!this.user
	}

	get userId() {
		return this.user?.id ?? 'default-user'
	}

	get authHeaders(): Record<string, string> {
		return this.token ? { Authorization: `Bearer ${this.token}` } : {}
	}

	private setAuth(token: string, user: IUser) {
		this.token = token
		this.user = user
		this.error = null
		localStorage.setItem('auth-token', token)
	}

	async register(username: string, email: string, password: string): Promise<boolean> {
		this.isLoading = true
		this.error = null
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password })
			})
			const data = await res.json()
			if (!res.ok) {
				runInAction(() => {
					this.error = data.error || 'Registration failed'
					this.isLoading = false
				})
				return false
			}
			runInAction(() => {
				this.setAuth(data.token, data.user)
				this.isLoading = false
			})
			return true
		} catch {
			runInAction(() => {
				this.error = 'Network error'
				this.isLoading = false
			})
			return false
		}
	}

	async login(email: string, password: string): Promise<boolean> {
		this.isLoading = true
		this.error = null
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			})
			const data = await res.json()
			if (!res.ok) {
				runInAction(() => {
					this.error = data.error || 'Login failed'
					this.isLoading = false
				})
				return false
			}
			runInAction(() => {
				this.setAuth(data.token, data.user)
				this.isLoading = false
			})
			return true
		} catch {
			runInAction(() => {
				this.error = 'Network error'
				this.isLoading = false
			})
			return false
		}
	}

	async fetchMe(): Promise<void> {
		if (!this.token) {
			this.isLoading = false
			return
		}
		try {
			const res = await fetch('/api/auth/me', {
				headers: { Authorization: `Bearer ${this.token}` }
			})
			if (res.status === 401) {
				runInAction(() => this.logout())
				return
			}
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const user: IUser = await res.json()
			runInAction(() => {
				this.user = user
				this.isLoading = false
			})
		} catch {
			runInAction(() => {
				this.isLoading = false
			})
		}
	}

	logout() {
		this.user = null
		this.token = null
		this.error = null
		this.isLoading = false
		localStorage.removeItem('auth-token')
	}
}

export const authStore = new AuthStore()

/**
 * Wrapper around fetch that automatically attaches auth headers
 * and handles 401 responses by logging the user out.
 */
export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
	const headers = new Headers(init?.headers)
	if (authStore.token) {
		headers.set('Authorization', `Bearer ${authStore.token}`)
	}

	const res = await fetch(url, { ...init, headers })

	if (res.status === 401 && authStore.token) {
		authStore.logout()
	}

	return res
}
