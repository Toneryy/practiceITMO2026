import { playerStore } from '@/store/player.store'
import { useEffect, useRef } from 'react'

export const useAudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null)

	useEffect(() => {
		if (!audioRef.current) return
		playerStore.isPlaying ? audioRef.current.play() : audioRef.current.pause()
	}, [playerStore.isPlaying, playerStore.currentTrack])

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = playerStore.volume / 100
		}
	}, [playerStore.volume])

	useEffect(() => {
		if (!audioRef.current || playerStore.seekRequest == null) return
		const wasPlaying = !audioRef.current.paused
		audioRef.current.currentTime = playerStore.seekRequest
		playerStore.clearSeekRequest()
		if (wasPlaying) {
			audioRef.current.play()
		}
	}, [playerStore.seekRequest])

	const onSeek = (time: number) => {
		if (!audioRef.current) return
		const wasPlaying = !audioRef.current.paused
		audioRef.current.currentTime = time
		playerStore.seek(time)
		if (wasPlaying) {
			audioRef.current.play()
		}
	}

	return { audioRef, onSeek }
}
