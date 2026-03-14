import type { LyricsLine } from '@/types/lyrics.types'
import { useEffect, useState } from 'react'

interface UseLyricsParams {
	trackId?: string
	trackName?: string
}

interface UseLyricsResult {
	lines: LyricsLine[] | null
	loading: boolean
}

/**
 * Fetches lyrics from the API. Tries trackId first (faster), then trackName as fallback.
 * Re-fetches automatically when trackId or trackName changes.
 */
export function useLyrics(params: UseLyricsParams | string | undefined): UseLyricsResult {
	const { trackId, trackName } =
		typeof params === 'string'
			? { trackId: params, trackName: undefined }
			: params ?? {}

	const [lines, setLines] = useState<LyricsLine[] | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!trackId && !trackName) {
			setLines(null)
			setLoading(false)
			return
		}

		let cancelled = false
		setLoading(true)
		setLines(null)

		const fetchUrl = async (url: string): Promise<LyricsLine[] | null> => {
			const res = await fetch(url)
			if (!res.ok) return null
			const data = await res.json()
			return Array.isArray(data) ? data : null
		}

		const run = async () => {
			let data: LyricsLine[] | null = null
			if (trackId) {
				data = await fetchUrl(`/api/lyrics/${encodeURIComponent(trackId)}`)
			}
			if (!cancelled && data === null && trackName) {
				data = await fetchUrl(
					`/api/lyrics/by-name/${encodeURIComponent(trackName)}`
				)
			}
			if (!cancelled) setLines(data)
			if (!cancelled) setLoading(false)
		}

		run().catch(() => {
			if (!cancelled) {
				setLines(null)
				setLoading(false)
			}
		})

		return () => {
			cancelled = true
		}
	}, [trackId, trackName])

	return { lines, loading }
}
