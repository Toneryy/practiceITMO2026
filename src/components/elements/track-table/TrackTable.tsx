import { TrackOptionsMenu } from '@/components/elements/track-item/TrackOptionsMenu'
import { ExplicitBadge } from '@/components/ui/explicit-badge/ExplicitBadge'
import { PagesConfig } from '@/config/pages.config'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import { GripVertical, Pause, Play } from 'lucide-react'
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
		<div className="flex flex-col gap-0">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={tracks.map(track => track.name)}
					strategy={verticalListSortingStrategy}
				>
					{tracks.map(track => (
						<TrackBlock
							key={track.name}
							track={track}
							trackList={tracks}
							playlistName={playlistName}
							canDrag={canDrag}
						/>
					))}
				</SortableContext>
			</DndContext>
		</div>
	)
})

interface BlockProps {
	track: ITrack
	trackList: ITrack[]
	playlistName?: string | null
	canDrag: boolean
}

const TrackBlock = observer(function TrackBlock({
	track,
	trackList,
	playlistName,
	canDrag
}: BlockProps) {
	const isActive = playerStore.currentTrack?.name === track.name

	const handleBlockClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement
		if (target.closest('button') || target.closest('a') || target.closest('[data-options-menu]'))
			return
		if (!isActive) playerStore.setTrack(track, trackList)
		playerStore.togglePlayPause()
	}

	const handlePlayClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!isActive) playerStore.setTrack(track, trackList)
		playerStore.togglePlayPause()
	}

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
				'hover:bg-white/5',
				canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
			)}
			onClick={handleBlockClick}
			{...(canDrag ? { ...attributes, ...listeners } : {})}
		>
			{/* Drag handle (playlists only) */}
			{canDrag && (
				<span className="hidden shrink-0 text-white/40 sm:flex" aria-hidden>
					<GripVertical size={16} />
				</span>
			)}

			{/* Cover + Play */}
			<div className="relative shrink-0">
				<img
					src={track.cover}
					alt=""
					className="h-10 w-10 shrink-0 rounded object-cover sm:h-12 sm:w-12"
				/>
				<button
					type="button"
					onClick={handlePlayClick}
					onPointerDown={e => e.stopPropagation()}
					className={cn(
						'absolute inset-0 flex items-center justify-center rounded bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100',
						'focus:outline-none focus:ring-0',
						isActive && 'opacity-100 bg-black/30'
					)}
					aria-label={isActive ? (playerStore.isPlaying ? 'Pause' : 'Play') : 'Play'}
				>
					{isActive && playerStore.isPlaying ? (
						<Pause size={20} className="fill-current" />
					) : (
						<Play size={20} className="fill-current" />
					)}
				</button>
			</div>

			{/* Title + Artist */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<Link
						to={PagesConfig.ALBUMS(encodeURIComponent(track.album))}
						onClick={e => e.stopPropagation()}
						className={cn(
							'truncate font-medium hover:underline',
							isActive ? 'text-primary' : 'text-white'
						)}
					>
						{track.name}
					</Link>
					{track.explicit && <ExplicitBadge />}
				</div>
				<Link
					to={PagesConfig.ARTISTS(encodeURIComponent(track.artist.name))}
					onClick={e => e.stopPropagation()}
					className="truncate block text-sm text-white/60 hover:underline hover:text-white"
				>
					{track.artist.name}
				</Link>
			</div>

			{/* Options menu */}
			<div className="shrink-0" data-options-menu onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
				<TrackOptionsMenu track={track} playlistName={playlistName} />
			</div>
		</div>
	)
})
