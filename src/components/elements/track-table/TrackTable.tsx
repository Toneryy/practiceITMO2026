import { TrackOptionsMenu } from '@/components/elements/track-item/TrackOptionsMenu'
import { PagesConfig } from '@/config/pages.config'
import { favoriteStore } from '@/store/favorite.store'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import { transformDuration } from '@/utils/transform-duration'
import { Clock, GripVertical, Heart, Pause, Play } from 'lucide-react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

import cn from 'clsx'

interface Props {
	tracks: ITrack[]
	playlistName?: string | null
	onReorder?: (oldIndex: number, newIndex: number) => void
}

export const TrackTable = observer(function TrackTable({
	tracks,
	playlistName,
	onReorder
}: Props) {
	const showDateAdded = !!playlistName
	const canDrag = Boolean(onReorder)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 }
		})
	)

	const handleDragEnd = (event: any) => {
		if (!onReorder) return
		const { active, over } = event
		if (!over || active.id === over.id) return
		const oldIndex = tracks.findIndex(track => track.name === active.id)
		const newIndex = tracks.findIndex(track => track.name === over.id)
		if (oldIndex === -1 || newIndex === -1) return
		onReorder(oldIndex, newIndex)
	}

	if (tracks.length === 0) return null

	return (
		<div className="w-full overflow-visible">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<table className="w-full table-fixed border-collapse">
					<thead className="sticky top-0 z-10 border-b border-white/10 bg-bg">
						<tr className="text-sm text-white/60">
							<th
								className={cn(
									'py-3 pr-0 text-center font-normal',
									canDrag ? 'w-16' : 'w-10'
								)}
							>
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
					<SortableContext
						items={tracks.map(track => track.name)}
						strategy={verticalListSortingStrategy}
					>
						<tbody>
							{tracks.map((track, index) => (
								<TrackTableRow
									key={track.name}
									track={track}
									index={index + 1}
									trackList={tracks}
									playlistName={playlistName}
									showDateAdded={showDateAdded}
									canDrag={canDrag}
								/>
							))}
						</tbody>
					</SortableContext>
				</table>
			</DndContext>
		</div>
	)
})

interface RowProps {
	track: ITrack
	index: number
	trackList: ITrack[]
	playlistName?: string | null
	showDateAdded: boolean
	canDrag: boolean
}

const TrackTableRow = observer(function TrackTableRow({
	track,
	index,
	trackList,
	playlistName,
	showDateAdded,
	canDrag
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

	const handlePlayClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!isActive) {
			playerStore.setTrack(track, trackList)
		}
		playerStore.togglePlayPause()
	}

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({
			id: track.name,
			disabled: !canDrag
		})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : undefined,
		zIndex: isDragging ? 50 : undefined,
		boxShadow: isDragging
			? '0 0 0 1px rgba(255,255,255,0.08), 0 10px 25px rgba(0,0,0,0.45)'
			: undefined
	}

	return (
		<tr
			className={cn(
				'group border-b border-white/5 hover:bg-white/10',
				canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
			)}
			onClick={handleRowClick}
			ref={setNodeRef}
			style={style}
			{...(canDrag ? { ...attributes, ...listeners } : {})}
		>
			{/* Drag handle / # / Play */}
			<td className={cn('py-2 pr-0 text-center', canDrag ? 'w-16' : 'w-10')}>
				<div className="flex items-center justify-center gap-0">
					{canDrag && (
						<span className="flex items-center justify-center text-white/40">
							<GripVertical size={16} />
						</span>
					)}
					<button
						type="button"
						onClick={handlePlayClick}
						onPointerDown={e => e.stopPropagation()}
						className="relative flex h-10 w-10 shrink-0 items-center justify-center text-white/60 outline-none ring-0 focus:outline-none focus:ring-0 group-hover:text-white"
					>
					{isActive ? (
						playerStore.isPlaying ? (
							<Pause size={16} className="fill-current" />
						) : (
							<Play size={16} className="fill-current" />
						)
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
				</div>
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
						<Link
							to={PagesConfig.ALBUMS(encodeURIComponent(track.album))}
							onClick={e => e.stopPropagation()}
							className={cn(
								'truncate block text-left font-medium hover:underline',
								isActive ? 'text-primary' : 'text-white'
							)}
						>
							{track.name}
						</Link>
						<Link
							to={PagesConfig.ARTISTS(encodeURIComponent(track.artist.name))}
							onClick={e => e.stopPropagation()}
							className="truncate block text-sm text-white/60 hover:underline hover:text-white"
						>
							{track.artist.name}
						</Link>
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
					onPointerDown={e => e.stopPropagation()}
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
				<div
					onClick={e => e.stopPropagation()}
					onPointerDown={e => e.stopPropagation()}
				>
					<TrackOptionsMenu
						track={track}
						playlistName={playlistName}
					/>
				</div>
			</td>
		</tr>
	)
})
