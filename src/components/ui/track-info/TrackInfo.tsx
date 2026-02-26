import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import { Pause, Play } from 'lucide-react'

import cn from 'clsx'

import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface Props {
	image: string
	title: string
	subTitle: string
	track?: ITrack
}

export function TrackInfo({ title, subTitle, image, track }: Props) {
	const isActive = playerStore.currentTrack?.name === track?.name

	return (
		<div className="flex items-center gap-3">
			{track ? (
				<button
					onClick={() => {
						if (!isActive) {
							playerStore.setTrack(track)
						}

						playerStore.togglePlayPause()
					}}
					className="block relative group"
				>
					{isActive && (
						<CircularProgressbar
							value={playerStore.progress}
							className="absolute"
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
							'absolute inset-0 flex items-center justify-center group-hover:opacity-100',
							isActive ? 'opacity-100' : 'opacity-0 duration-300'
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
						className="w-12 h-12 rounded-full m-1.5"
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
				<div className="text-white text-lg font-medium">
					{track ? (
						<button
							onClick={() => {
								if (!isActive) {
									playerStore.setTrack(track)
									playerStore.play()
								}
							}}
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
}
