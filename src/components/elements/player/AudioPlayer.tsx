import { ProgressBar } from '@/components/ui/progress-bar/ProgressBar'
import { TrackInfo } from '@/components/ui/track-info/TrackInfo'
import { favoriteStore } from '@/store/favorite.store'
import { playerStore } from '@/store/player.store'
import cn from 'clsx'
import {
	FileText,
	Heart,
	List,
	Maximize2,
	Pause,
	Play,
	Repeat,
	Repeat1,
	Shuffle,
	SkipBack,
	SkipForward,
	Volume,
	Volume1,
	Volume2
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useAudioPlayer } from './useAudioPlayer'

export const AudioPlayer = observer(function AudioPlayer() {
	const { audioRef, onSeek } = useAudioPlayer()
	const { t } = useTranslation()

	if (!playerStore.currentTrack) return null

	const handleEnded = () => {
		if (playerStore.repeatMode === 'one') {
			if (audioRef.current) {
				audioRef.current.currentTime = 0
				audioRef.current.play()
			}
			playerStore.seek(0)
		} else {
			playerStore.changeTrack('next')
		}
	}

	const VolumeIcon =
		playerStore.volume === 0
			? Volume
			: playerStore.volume < 50
				? Volume1
				: Volume2

	return (
		<div className="fixed bottom-0 left-0 z-50 grid w-full grid-cols-3 gap-4 border-t border-white/10 bg-player-bg px-6 py-2.5">
			<audio
				ref={audioRef}
				src={playerStore.currentTrack.file}
				onTimeUpdate={e =>
					playerStore.seek(Math.floor(e.currentTarget.currentTime))
				}
				onEnded={handleEnded}
			/>

			{/* Left: Track info + like */}
			<div className="flex min-w-0 items-center gap-8">
				<TrackInfo
					title={playerStore.currentTrack.name}
					subTitle={playerStore.currentTrack.artist.name}
					image={playerStore.currentTrack.cover}
				/>
				<button
					type="button"
					onClick={() =>
						favoriteStore.toggleFavorite(playerStore.currentTrack!.name)
					}
					className="shrink-0 opacity-60 transition hover:opacity-100"
					title={
						favoriteStore.favoritesName.includes(
							playerStore.currentTrack!.name
						)
							? t('player.removeFromFavorites')
							: t('player.addToFavorites')
					}
				>
					<Heart
						size={24}
						className={cn(
							favoriteStore.favoritesName.includes(
								playerStore.currentTrack!.name
							)
								? 'fill-primary text-primary'
								: undefined
						)}
					/>
				</button>
			</div>

			{/* Center: Playback controls */}
			<div className="flex flex-col items-center justify-center gap-1.5">
				<div className="flex items-center gap-5">
					<button
						type="button"
						onClick={() => playerStore.toggleShuffle()}
						className={`p-1 opacity-60 transition hover:opacity-100 ${playerStore.isShuffle ? 'text-primary opacity-100' : 'text-zinc-500'}`}
						title={playerStore.isShuffle ? t('player.shuffleOn') : t('player.shuffleOff')}
					>
						<Shuffle size={18} />
					</button>
					<button
						type="button"
						onClick={() => playerStore.changeTrack('prev')}
						className="opacity-60 transition hover:opacity-100"
						title={t('player.prevTrack')}
					>
						<SkipBack size={20} />
					</button>
					<button
						type="button"
						className="rounded-full bg-primary p-2.5 text-black transition hover:scale-105"
						onClick={() => playerStore.togglePlayPause()}
					>
						{playerStore.isPlaying ? (
							<Pause size={20} fill="currentColor" />
						) : (
							<Play size={20} fill="currentColor" />
						)}
					</button>
					<button
						type="button"
						onClick={() => playerStore.changeTrack('next')}
						className="opacity-60 transition hover:opacity-100"
						title={t('player.nextTrack')}
					>
						<SkipForward size={20} />
					</button>
					<button
						type="button"
						onClick={() => playerStore.toggleRepeat()}
						className={`p-1 opacity-60 transition hover:opacity-100 ${playerStore.repeatMode !== 'none' ? 'text-primary opacity-100' : 'text-zinc-500'}`}
						title={t('player.repeat', { mode: playerStore.repeatMode })}
					>
						{playerStore.repeatMode === 'one' ? (
							<Repeat1 size={18} />
						) : (
							<Repeat size={18} />
						)}
					</button>
				</div>
				<div className="w-full max-w-2xl">
					<ProgressBar
						currentValue={playerStore.currentTime}
						value={playerStore.currentTrack.duration}
						progress={playerStore.progress}
						onSeek={onSeek}
						isTextDisplayed
					/>
				</div>
			</div>

			{/* Right: Volume & extras */}
			<div className="flex min-w-0 items-center justify-end gap-3">
				<button
					type="button"
					onClick={() => playerStore.toggleQueue()}
					className={`p-1.5 opacity-60 transition hover:opacity-100 ${playerStore.queueOpen ? 'text-primary opacity-100' : 'text-zinc-500 hover:text-white'}`}
					title={playerStore.queueOpen ? t('player.hideQueue') : t('player.showQueue')}
				>
					<List size={22} />
				</button>
				<button
					type="button"
					onClick={() => playerStore.toggleLyrics()}
					className={`p-1.5 opacity-60 transition hover:opacity-100 ${playerStore.lyricsOpen ? 'text-primary opacity-100' : 'text-zinc-500 hover:text-white'}`}
					title={playerStore.lyricsOpen ? t('player.hideLyrics') : t('player.showLyrics')}
				>
					<FileText size={22} />
				</button>
				<button
					type="button"
					onClick={() => {
						const next = playerStore.volume === 0 ? 85 : 0
						playerStore.setVolume(next)
						if (audioRef.current) {
							audioRef.current.volume = next / 100
						}
					}}
					className="opacity-60 transition hover:opacity-100"
				>
					<VolumeIcon size={22} />
				</button>
				<div className="w-28 min-w-[100px] max-w-[160px]">
					<ProgressBar
						currentValue={playerStore.volume}
						value={100}
						progress={playerStore.volume}
						onSeek={val => {
							playerStore.setVolume(val)
							if (audioRef.current) {
								audioRef.current.volume = val / 100
							}
						}}
						isTextDisplayed={false}
						isThumbDisplayed
					/>
				</div>
				<button
					type="button"
					onClick={() => playerStore.toggleFullscreen()}
					className={`p-1.5 opacity-60 transition hover:opacity-100 ${playerStore.fullscreenOpen ? 'text-primary opacity-100' : ''}`}
					title={t('player.fullscreen')}
				>
					<Maximize2 size={22} />
				</button>
			</div>
		</div>
	)
})
