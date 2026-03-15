import { ExplicitBadge } from '@/components/ui/explicit-badge/ExplicitBadge'
import { PagesConfig } from '@/config/pages.config'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import { Pause, Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

import cn from 'clsx'

import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface Props {
	image: string
	title: string
	subTitle: string
	/** If provided, the subtitle becomes a clickable link to the artist page */
	artistName?: string
	/** If provided, the title becomes a clickable link to the album page */
	albumName?: string
	explicit?: boolean
	track?: ITrack
	trackList?: ITrack[]
	/** Compact mode for player bar on mobile */
	compact?: boolean
}

export const TrackInfo = observer(function TrackInfo({
	title,
	subTitle,
	artistName,
	albumName,
	image,
	explicit,
	track,
	trackList,
	compact
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
		<div className={cn('flex items-center gap-3', compact && 'gap-2')}>
			{track ? (
				<button
					onClick={handleSetTrack}
					className={cn(
						'group relative shrink-0 items-center justify-center',
						compact ? 'flex h-10 w-10 sm:h-12 sm:w-12' : 'flex h-12 w-12'
					)}
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
						className={cn(
							'rounded-full object-cover',
							compact ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-12 w-12'
						)}
					/>
				</button>
			) : (
				<img
					src={image}
					alt={title}
					className={cn(
						'rounded-full',
						compact ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-12 w-12'
					)}
				/>
			)}

		<div className="min-w-0">
			<div
				className={cn(
					'flex items-center gap-1.5 font-medium',
					compact ? 'text-sm sm:text-base' : 'text-lg',
					isActive ? 'text-primary' : 'text-white'
				)}
			>
				{albumName ? (
					<Link
						to={PagesConfig.ALBUMS(encodeURIComponent(albumName))}
						className="truncate hover:underline"
					>
						{title}
					</Link>
				) : track ? (
					<button onClick={handleTitleClick} className="truncate hover:underline">
						{title}
					</button>
				) : (
					<span className="truncate">{title}</span>
				)}
				{explicit && <ExplicitBadge />}
			</div>
			{artistName ? (
				<Link
					to={PagesConfig.ARTISTS(encodeURIComponent(artistName))}
					className={cn(
						'truncate block text-white/60 hover:underline hover:text-white',
						compact ? 'text-xs sm:text-sm' : 'text-sm'
					)}
				>
					{subTitle}
				</Link>
			) : (
				<div
					className={cn(
						'truncate text-white/60',
						compact ? 'text-xs sm:text-sm' : 'text-sm'
					)}
				>
					{subTitle}
				</div>
			)}
		</div>
		</div>
	)
})
