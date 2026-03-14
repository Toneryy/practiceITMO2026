import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import { Pause, Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'

import cn from 'clsx'

import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface Props {
	image: string
	title: string
	subTitle: string
	track?: ITrack
	trackList?: ITrack[]
}

export const TrackInfo = observer(function TrackInfo({
	title,
	subTitle,
	image,
	track,
	trackList
}: Props) {
	const isActive = playerStore.currentTrack?.name === track?.name

	const handleSetTrack = () => {
		if (!track) return
		if (!isActive) {
			playerStore.setTrack(track, trackList)
		}
		playerStore.togglePlayPause()
	}

	const handleTitleClick = () => {
		if (!track) return
		if (!isActive) {
			playerStore.setTrack(track, trackList)
			playerStore.play()
		}
	}

	return (
		<div className="flex items-center gap-3">
			{track ? (
				<button
					onClick={handleSetTrack}
					className="group relative flex h-12 w-12 shrink-0 items-center justify-center"
				>
					{isActive && (
						<CircularProgressbar
							value={playerStore.progress}
							className="absolute inset-0 h-full w-full"
							strokeWidth={5}
							styles={{
								trail: { stroke: '#2E3235' },
								path: {
									stroke: 'var(--color-primary)',
									transition: 'stroke-dashoffset 0.5s ease 0s'
								}
							}}
							counterClockwise
						/>
					)}

					<div
						className={cn(
							'absolute inset-0 flex items-center justify-center duration-300 group-hover:opacity-100',
							isActive ? 'opacity-100' : 'opacity-0'
						)}
					>
						{!isActive ? (
							<Play />
						) : playerStore.isPlaying ? (
							<Pause />
						) : (
							<Play />
						)}
					</div>

					<img
						src={image}
						alt={title}
						className="h-12 w-12 rounded-full object-cover"
					/>
				</button>
			) : (
				<img
					src={image}
					alt={title}
					className="w-12 h-12 rounded-full"
				/>
			)}

			<div>
				<div
					className={cn(
						'text-lg font-medium',
						isActive ? 'text-primary' : 'text-white'
					)}
				>
					{track ? (
						<button
							onClick={handleTitleClick}
							className="hover:underline"
						>
							{title}
						</button>
					) : (
						title
					)}
				</div>
				<div>{subTitle}</div>
			</div>
		</div>
	)
})
