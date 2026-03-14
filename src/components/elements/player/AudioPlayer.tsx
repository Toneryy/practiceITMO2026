import { ProgressBar } from '@/components/ui/progress-bar/ProgressBar'
import { TrackInfo } from '@/components/ui/track-info/TrackInfo'
import { playerStore } from '@/store/player.store'
import {
	FileText,
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
import { useAudioPlayer } from './useAudioPlayer'

export const AudioPlayer = observer(function AudioPlayer() {
	const { audioRef, onSeek } = useAudioPlayer()

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
		<div className="fixed bottom-0 left-0 z-50 grid w-full grid-cols-[1.2fr_5fr] gap-8 border-t border-white/10 bg-player-bg px-10 py-5">
			<TrackInfo
				title={playerStore.currentTrack.name}
				subTitle={playerStore.currentTrack.artist.name}
				image={playerStore.currentTrack.cover}
			/>

			<div className="flex flex-col justify-center gap-4">
				<audio
					ref={audioRef}
					src={playerStore.currentTrack.file}
					onTimeUpdate={e =>
						playerStore.seek(Math.floor(e.currentTarget.currentTime))
					}
					onEnded={handleEnded}
				/>

				<div className="grid grid-cols-[1fr_6.9fr_2fr] items-center gap-8">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => playerStore.toggleShuffle()}
							className={`p-1 transition hover:opacity-100 ${playerStore.isShuffle ? 'text-primary opacity-100' : 'text-zinc-500 opacity-70'}`}
							title={playerStore.isShuffle ? 'Shuffle on' : 'Shuffle off'}
						>
							<Shuffle size={20} />
						</button>
						<button
							type="button"
							onClick={() => playerStore.changeTrack('prev')}
							className="opacity-70 transition hover:opacity-100"
							title="Previous track"
						>
							<SkipBack size={22} />
						</button>
						<button
							type="button"
							className="rounded-full bg-primary p-3 text-black transition hover:scale-105"
							onClick={() => playerStore.togglePlayPause()}
						>
							{playerStore.isPlaying ? (
								<Pause size={22} fill="currentColor" />
							) : (
								<Play size={22} fill="currentColor" />
							)}
						</button>
						<button
							type="button"
							onClick={() => playerStore.changeTrack('next')}
							className="opacity-70 transition hover:opacity-100"
							title="Next track"
						>
							<SkipForward size={22} />
						</button>
						<button
							type="button"
							onClick={() => playerStore.toggleRepeat()}
							className={`p-1 transition hover:opacity-100 ${playerStore.repeatMode !== 'none' ? 'text-primary opacity-100' : 'text-zinc-500 opacity-70'}`}
							title={`Repeat: ${playerStore.repeatMode}`}
						>
							{playerStore.repeatMode === 'one' ? (
								<Repeat1 size={20} />
							) : (
								<Repeat size={20} />
							)}
						</button>
					</div>

					<ProgressBar
						currentValue={playerStore.currentTime}
						value={playerStore.currentTrack.duration}
						progress={playerStore.progress}
						onSeek={onSeek}
						isTextDisplayed
					/>

					<div className="flex items-center gap-3 pl-6">
						<button
							type="button"
							onClick={() => playerStore.toggleLyrics()}
							className={`p-1.5 transition hover:opacity-100 ${playerStore.lyricsOpen ? 'text-primary opacity-100' : 'text-zinc-500 opacity-60 hover:text-white'}`}
							title={playerStore.lyricsOpen ? 'Hide lyrics' : 'Show lyrics'}
						>
							<FileText size={20} />
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
						>
							<VolumeIcon size={20} />
						</button>
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
				</div>
			</div>
		</div>
	)
})
