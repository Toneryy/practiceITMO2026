import { reaction } from 'mobx'
import { playerStore } from './player.store'
import { authStore, authFetch } from './auth.store'

const LISTEN_THRESHOLD_MS = 300

let listenTimer: ReturnType<typeof setTimeout> | null = null

function clearListenTimer() {
	if (listenTimer) {
		clearTimeout(listenTimer)
		listenTimer = null
	}
}

function sendListenRecord(trackName: string) {
	authFetch('/api/listen-history', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ trackName })
	}).catch(() => {})
}

export function initListenHistoryReaction() {
	reaction(
		() => playerStore.currentTrack?.name,
		(trackName) => {
			clearListenTimer()

			if (!trackName || !authStore.isAuthenticated) return

			listenTimer = setTimeout(() => {
				if (
					playerStore.currentTrack?.name === trackName &&
					playerStore.isPlaying
				) {
					sendListenRecord(trackName)
				}
			}, LISTEN_THRESHOLD_MS)
		}
	)

	reaction(
		() => playerStore.isPlaying,
		(isPlaying) => {
			if (!isPlaying) {
				clearListenTimer()
			}
		}
	)
}
