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
		<div className="fixed bottom-0 left-0 z-50 flex w-full flex-col gap-1.5 border-t border-white/10 bg-player-bg px-3 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-2.5">
			<audio
				ref={audioRef}
				src={playerStore.currentTrack.file}
				onTimeUpdate={e =>
					playerStore.seek(Math.floor(e.currentTarget.currentTime))
				}
				onEnded={handleEnded}
				onError={() => {
					playerStore.pause()
				}}
			/>

			{/* Mobile: minimal bar — [cover | title+artist] [like] [play], tap area opens fullscreen */}
			<div className="flex min-w-0 items-center gap-3 sm:contents">
				{/* Mobile: clickable track area (opens fullscreen) */}
				<button
					type="button"
					onClick={() => playerStore.toggleFullscreen()}
					className="flex min-w-0 flex-1 items-center gap-3 text-left sm:hidden"
				>
					<img
						src={playerStore.currentTrack.cover}
						alt=""
						className="h-10 w-10 shrink-0 rounded object-cover"
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-white">
							{playerStore.currentTrack.name}
						</p>
						<p className="truncate text-xs text-white/60">
							{playerStore.currentTrack.artist.name}
						</p>
					</div>
				</button>

				{/* Desktop: Track info + like */}
				<div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex sm:gap-8">
					<TrackInfo
						title={playerStore.currentTrack.name}
						subTitle={playerStore.currentTrack.artist.name}
						artistName={playerStore.currentTrack.artist.name}
						albumName={playerStore.currentTrack.album}
						image={playerStore.currentTrack.cover}
						explicit={playerStore.currentTrack.explicit}
						compact
					/>
					<button
						type="button"
						onClick={() =>
							favoriteStore.toggleFavorite(playerStore.currentTrack!.name)
						}
						className="shrink-0 p-1 opacity-60 transition hover:opacity-100"
						title={
							favoriteStore.favoritesName.includes(
								playerStore.currentTrack!.name
							)
								? t('player.removeFromFavorites')
								: t('player.addToFavorites')
						}
					>
						<Heart
							size={20}
							className={cn(
								'sm:w-6 sm:h-6',
								favoriteStore.favoritesName.includes(
									playerStore.currentTrack!.name
								)
									? 'fill-primary text-primary'
									: undefined
							)}
						/>
					</button>
				</div>

				{/* Mobile: like + play */}
				<div className="flex shrink-0 items-center gap-2 sm:hidden">
					<button
						type="button"
						onClick={e => {
							e.stopPropagation()
							favoriteStore.toggleFavorite(playerStore.currentTrack!.name)
						}}
						className="p-2 opacity-60 transition hover:opacity-100"
					>
						<Heart
							size={20}
							className={cn(
								favoriteStore.favoritesName.includes(
									playerStore.currentTrack!.name
								) && 'fill-primary text-primary'
							)}
						/>
					</button>
					<button
						type="button"
						onClick={e => {
							e.stopPropagation()
							playerStore.togglePlayPause()
						}}
						className="rounded-full bg-primary p-2.5 text-black transition hover:scale-105"
					>
						{playerStore.isPlaying ? (
							<Pause size={18} fill="currentColor" />
						) : (
							<Play size={18} fill="currentColor" />
						)}
					</button>
				</div>

				{/* Center: Playback controls — desktop only */}
				<div className="hidden flex-col items-center justify-center gap-1 sm:flex sm:gap-1.5">
					<div className="flex items-center justify-center gap-2 sm:gap-5">
						<button
							type="button"
							onClick={() => playerStore.toggleShuffle()}
							className={cn(
								'p-1 opacity-60 transition hover:opacity-100',
								playerStore.isShuffle && 'text-primary opacity-100'
							)}
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
							className={cn(
								'p-1 opacity-60 transition hover:opacity-100',
								playerStore.repeatMode !== 'none' && 'text-primary opacity-100'
							)}
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

				{/* Right: Volume & extras — desktop only */}
				<div className="hidden min-w-0 shrink-0 items-center justify-end gap-2 sm:flex sm:gap-3">
					<button
						type="button"
						onClick={() => playerStore.toggleQueue()}
						className={cn(
							'p-1.5 opacity-60 transition hover:opacity-100',
							playerStore.queueOpen ? 'text-primary opacity-100' : 'text-zinc-500 hover:text-white'
						)}
						title={playerStore.queueOpen ? t('player.hideQueue') : t('player.showQueue')}
					>
						<List size={22} />
					</button>
					<button
						type="button"
						onClick={() => playerStore.toggleLyrics()}
						className={cn(
							'p-1.5 opacity-60 transition hover:opacity-100',
							playerStore.lyricsOpen ? 'text-primary opacity-100' : 'text-zinc-500 hover:text-white'
						)}
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
						className="shrink-0 opacity-60 transition hover:opacity-100"
						title={playerStore.volume === 0 ? t('player.unmute') : t('player.mute')}
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
						className={cn(
							'p-1.5 opacity-60 transition hover:opacity-100',
							playerStore.fullscreenOpen && 'text-primary opacity-100'
						)}
						title={t('player.fullscreen')}
					>
						<Maximize2 size={22} />
					</button>
				</div>
			</div>
		</div>
	)
})
