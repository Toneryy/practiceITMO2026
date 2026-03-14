import { TrackOptionsMenu } from '@/components/elements/track-item/TrackOptionsMenu'
import { PagesConfig } from '@/config/pages.config'
import { favoriteStore } from '@/store/favorite.store'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import { transformDuration } from '@/utils/transform-duration'
import { Clock, Heart, Pause, Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

import cn from 'clsx'

import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface Props {
	tracks: ITrack[]
	playlistName?: string | null
}

export const TrackTable = observer(function TrackTable({
	tracks,
	playlistName
}: Props) {
	const showDateAdded = !!playlistName

	if (tracks.length === 0) return null

	return (
		<div className="w-full overflow-visible">
			<table className="w-full table-fixed border-collapse">
				<thead className="sticky top-0 z-10 border-b border-white/10 bg-bg">
					<tr className="text-sm text-white/60">
						<th className="w-10 py-3 pr-0 text-center font-normal">
							#
						</th>
						<th
							className="min-w-0 py-3 px-3 font-normal text-left"
							style={{ width: '40%' }}
						>
							Title
						</th>
						<th
							className="min-w-0 py-3 px-3 font-normal text-left"
							style={{ width: '25%' }}
						>
							Album
						</th>
						{showDateAdded && (
							<th
								className="min-w-0 py-3 px-3 font-normal text-left"
								style={{ width: '12%' }}
							>
								Date Added
							</th>
						)}
						<th className="w-10 py-3 font-normal text-center" />
						<th className="w-16 py-3 pr-3 font-normal align-middle text-center">
							<span className="flex w-full items-center justify-center">
								<Clock size={16} className="shrink-0 opacity-60" />
							</span>
						</th>
						<th className="w-12 py-3 pl-6 font-normal text-center" />
					</tr>
				</thead>
				<tbody>
					{tracks.map((track, index) => (
						<TrackTableRow
							key={track.name}
							track={track}
							index={index + 1}
							trackList={tracks}
							playlistName={playlistName}
							showDateAdded={showDateAdded}
						/>
					))}
				</tbody>
			</table>
		</div>
	)
})

interface RowProps {
	track: ITrack
	index: number
	trackList: ITrack[]
	playlistName?: string | null
	showDateAdded: boolean
}

const TrackTableRow = observer(function TrackTableRow({
	track,
	index,
	trackList,
	playlistName,
	showDateAdded
}: RowProps) {
	const isActive = playerStore.currentTrack?.name === track.name

	const handleRowClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement
		if (
			target.closest('button') ||
			target.closest('a') ||
			target.closest('[data-options-menu]')
		)
			return
		if (!isActive) {
			playerStore.setTrack(track, trackList)
		}
		playerStore.togglePlayPause()
	}

	const handleTitleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!isActive) {
			playerStore.setTrack(track, trackList)
		}
		playerStore.play()
	}

	const handlePlayClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!isActive) {
			playerStore.setTrack(track, trackList)
		}
		playerStore.togglePlayPause()
	}

	return (
		<tr
			className="group cursor-pointer border-b border-white/5 hover:bg-white/10"
			onClick={handleRowClick}
		>
			{/* # / Play */}
			<td className="w-10 py-2 pr-0 text-center">
				<button
					type="button"
					onClick={handlePlayClick}
					className="relative mx-auto flex h-10 w-10 items-center justify-center text-white/60 group-hover:text-white"
				>
					{isActive ? (
						<>
							<CircularProgressbar
								value={playerStore.progress}
								className="absolute inset-0 h-full w-full"
								strokeWidth={4}
								styles={{
									trail: { stroke: '#2E3235' },
									path: {
										stroke: 'var(--color-primary)',
										transition: 'stroke-dashoffset 0.5s ease 0s'
									}
								}}
								counterClockwise
							/>
							{playerStore.isPlaying ? (
								<Pause size={16} className="fill-current" />
							) : (
								<Play size={16} className="fill-current" />
							)}
						</>
					) : (
						<>
							<span className="tabular-nums group-hover:hidden">
								{index}
							</span>
							<Play
								size={16}
								className="hidden fill-current group-hover:block"
							/>
						</>
					)}
				</button>
			</td>

			{/* Title */}
			<td className="min-w-0 py-2 px-3 text-left" style={{ width: '40%' }}>
				<div className="flex items-center gap-3">
					<img
						src={track.cover}
						alt=""
						className="h-10 w-10 shrink-0 rounded object-cover"
					/>
					<div className="min-w-0">
						<button
							type="button"
							onClick={handleTitleClick}
							className={cn(
								'truncate text-left font-medium hover:underline',
								isActive ? 'text-primary' : 'text-white'
							)}
						>
							{track.name}
						</button>
						<p className="truncate text-sm text-white/60">
							{track.artist.name}
						</p>
					</div>
				</div>
			</td>

			{/* Album */}
			<td className="min-w-0 py-2 px-3 text-left" style={{ width: '25%' }}>
				<Link
					to={PagesConfig.ALBUMS(encodeURIComponent(track.album))}
					onClick={e => e.stopPropagation()}
					className="truncate text-white/60 hover:underline hover:text-white"
				>
					{track.album}
				</Link>
			</td>

			{/* Date Added */}
			{showDateAdded && (
				<td
					className="min-w-0 py-2 px-3 text-left text-sm text-white/50"
					style={{ width: '12%' }}
				>
					—
				</td>
			)}

			{/* Heart */}
			<td className="w-10 py-2 text-center">
				<button
					type="button"
					onClick={e => {
						e.stopPropagation()
						favoriteStore.toggleFavorite(track.name)
					}}
					className="mx-auto flex items-center justify-center"
				>
					<Heart
						size={18}
						className={cn(
							'duration-300 hover:opacity-100',
							favoriteStore.favoritesName.includes(track.name)
								? 'fill-primary text-primary'
								: 'opacity-60'
						)}
					/>
				</button>
			</td>

			{/* Duration */}
			<td className="w-16 py-2 pr-3 text-center text-sm text-white/60 tabular-nums">
				<span className="flex w-full items-center justify-center">
					{transformDuration(track.duration)}
				</span>
			</td>

			{/* Options */}
			<td className="w-12 py-2 pl-6 text-center" data-options-menu>
				<div onClick={e => e.stopPropagation()}>
					<TrackOptionsMenu
						track={track}
						playlistName={playlistName}
					/>
				</div>
			</td>
		</tr>
	)
})
