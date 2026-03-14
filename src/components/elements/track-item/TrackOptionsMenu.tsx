import { PagesConfig } from '@/config/pages.config'
import { playlistStore } from '@/store/playlist.store'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import {
	ChevronRight,
	Disc,
	Info,
	ListMusic,
	MoreHorizontal,
	Plus,
	Quote,
	Radio,
	Search,
	Share2,
	Trash2,
	User
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import cn from 'clsx'

const MENU_WIDTH = 240
const SUBMENU_WIDTH = 220
const ICON_SIZE = 18

interface Props {
	track: ITrack
	playlistName?: string | null
	inQueue?: boolean
}

export const TrackOptionsMenu = observer(function TrackOptionsMenu({
	track,
	playlistName,
	inQueue
}: Props) {
	const [open, setOpen] = useState(false)
	const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false)
	const [playlistSearch, setPlaylistSearch] = useState('')
	const menuRef = useRef<HTMLDivElement>(null)
	const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const navigate = useNavigate()

	const filteredPlaylists = useMemo(() => {
		const q = playlistSearch.trim().toLowerCase()
		if (!q) return playlistStore.playlists
		return playlistStore.playlists.filter(p =>
			p.name.toLowerCase().includes(q)
		)
	}, [playlistStore.playlists, playlistSearch])

	useEffect(() => {
		if (!open) return
		const handleMouseDown = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				setOpen(false)
				setAddToPlaylistOpen(false)
				setPlaylistSearch('')
			}
		}
		document.addEventListener('mousedown', handleMouseDown)
		return () => document.removeEventListener('mousedown', handleMouseDown)
	}, [open])

	const close = () => {
		setOpen(false)
		setAddToPlaylistOpen(false)
		setPlaylistSearch('')
	}

	const handleShowLyrics = () => {
		if (!playerStore.lyricsOpen) playerStore.toggleLyrics()
		close()
		requestAnimationFrame(() => {
			document.getElementById('lyrics-panel')?.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			})
		})
	}

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href)
			toast.success('Link copied to clipboard')
		} catch {
			// clipboard unavailable
		}
		close()
	}

	const handleCreatePlaylist = () => {
		const name = window.prompt('Playlist name', 'New Playlist')?.trim()
		if (name) {
			playlistStore.createPlaylist(name)
			playlistStore.toggleTrackInPlaylist(name, track.name)
			setAddToPlaylistOpen(false)
		}
	}

	const menuItemClass =
		'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 transition-colors'

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setOpen(prev => !prev)}
				className="rounded-md p-1.5 text-white/40 transition-opacity hover:text-white"
				title="Options"
			>
				<MoreHorizontal size={20} />
			</button>

			{open && (
				<div
					className="fade-in absolute right-0 top-full z-50 mt-1 rounded-md bg-[#282828] py-1.5 shadow-xl"
					style={{ width: `${MENU_WIDTH}px` }}
				>
					{/* Section 1: Queue */}
					<div className="px-1">
						<button
							type="button"
							className={menuItemClass}
							onClick={() => {
								playerStore.addToQueue(track)
								toast('Added to queue', {
									icon: (
										<ListMusic
											size={18}
											style={{ color: 'var(--color-primary)' }}
										/>
									)
								})
								close()
							}}
						>
							<ListMusic size={ICON_SIZE} className="shrink-0" />
							Add to Queue
						</button>
						<button
							type="button"
							className={menuItemClass}
							onClick={() => {
								playerStore.playNext(track)
								toast('Will play next')
								close()
							}}
						>
							<Plus size={ICON_SIZE} className="shrink-0" />
							Play Next
						</button>
					</div>

					<div className="my-1 border-t border-white/10" />

					{/* Section 2: Go to Artist / Album */}
					<div className="px-1">
						<button
							type="button"
							className={menuItemClass}
							onClick={() => {
								navigate(
									PagesConfig.ARTISTS(
										encodeURIComponent(track.artist.name)
									)
								)
								close()
							}}
						>
							<User size={ICON_SIZE} className="shrink-0" />
							Go to Artist
						</button>
						<button
							type="button"
							className={menuItemClass}
							onClick={() => {
								navigate(
									PagesConfig.ALBUMS(
										encodeURIComponent(track.album)
									)
								)
								close()
							}}
						>
							<Disc size={ICON_SIZE} className="shrink-0" />
							Go to Album
						</button>
					</div>

					<div className="my-1 border-t border-white/10" />

					{/* Section 3: Show Lyrics */}
					<div className="px-1">
						<button
							type="button"
							className={menuItemClass}
							onClick={handleShowLyrics}
						>
							<Quote size={ICON_SIZE} className="shrink-0" />
							Show Lyrics
						</button>
					</div>

					<div className="my-1 border-t border-white/10" />

					{/* Section 4: Add to Playlist (with submenu to the left) */}
					<div
						className="relative px-1"
						onMouseEnter={() => {
							if (submenuTimeoutRef.current) {
								clearTimeout(submenuTimeoutRef.current)
								submenuTimeoutRef.current = null
							}
							setAddToPlaylistOpen(true)
						}}
						onMouseLeave={() => {
							submenuTimeoutRef.current = setTimeout(() => {
								setAddToPlaylistOpen(false)
								submenuTimeoutRef.current = null
							}, 150)
						}}
					>
						<button
							type="button"
							className={cn(
								menuItemClass,
								'flex w-full items-center justify-between'
							)}
							onClick={() =>
								setAddToPlaylistOpen(prev => !prev)
							}
						>
							<span className="flex items-center gap-2">
								<Plus size={ICON_SIZE} className="shrink-0" />
								Add to Playlist
							</span>
							<ChevronRight size={ICON_SIZE} className="shrink-0" />
						</button>

						{addToPlaylistOpen && (
							<div
								className="fade-in absolute right-full top-0 z-50 mr-1 rounded-md bg-[#282828] py-1.5 shadow-xl"
								style={{ width: `${SUBMENU_WIDTH}px` }}
								onMouseEnter={() => {
									if (submenuTimeoutRef.current) {
										clearTimeout(submenuTimeoutRef.current)
										submenuTimeoutRef.current = null
									}
								}}
								onMouseLeave={() => {
									submenuTimeoutRef.current = setTimeout(
										() => {
											setAddToPlaylistOpen(false)
											submenuTimeoutRef.current = null
										},
										150
									)
								}}
							>
								{/* Search */}
								<div className="px-2 pb-1.5">
									<div className="flex items-center gap-2 rounded-md bg-white/10 px-2 py-1.5">
										<Search
											size={ICON_SIZE}
											className="shrink-0 text-white/50"
										/>
										<input
											type="text"
											placeholder="Search playlist"
											value={playlistSearch}
											onChange={e =>
												setPlaylistSearch(e.target.value)
											}
											className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
										/>
									</div>
								</div>

								{/* Create playlist */}
								<button
									type="button"
									className={cn(
										menuItemClass,
										'mx-1 flex items-center gap-2'
									)}
									onClick={handleCreatePlaylist}
								>
									<Plus size={ICON_SIZE} className="shrink-0" />
									Create playlist
								</button>

								<div className="my-1 border-t border-white/10" />

								{/* Scrollable playlist list */}
								<div className="max-h-48 overflow-y-auto py-0.5">
									{filteredPlaylists.length === 0 ? (
										<div className="px-3 py-2 text-xs text-white/50">
											{playlistSearch.trim()
												? 'No results'
												: 'No playlists'}
										</div>
									) : (
										filteredPlaylists.map(pl => {
											const isIn =
												playlistStore.isTrackInPlaylist(
													pl.name,
													track.name
												)
											return (
												<button
													key={pl.name}
													type="button"
													onClick={() => {
														playlistStore.toggleTrackInPlaylist(
															pl.name,
															track.name
														)
													}}
													className={cn(
														'w-full px-3 py-2 text-left text-sm rounded-md transition-colors',
														isIn
															? 'font-medium text-primary'
															: 'text-white/90 hover:bg-white/10'
													)}
												>
													{pl.name}
												</button>
											)
										})
									)}
								</div>
							</div>
						)}
					</div>

					{/* Radio (stub) */}
					<div className="px-1">
						<button
							type="button"
							className={menuItemClass}
							onClick={() => close()}
						>
							<Radio size={ICON_SIZE} className="shrink-0" />
							Go to track radio
						</button>
					</div>

					<div className="my-1 border-t border-white/10" />

					{/* Info */}
					<div className="px-1">
						<button
							type="button"
							className={menuItemClass}
							onClick={() => close()}
						>
							<Info size={ICON_SIZE} className="shrink-0" />
							View details
						</button>
					</div>

					{/* Remove from playlist (when in playlist) */}
					{playlistName && (
						<>
							<div className="my-1 border-t border-white/10" />
							<div className="px-1">
								<button
									type="button"
									className={cn(
										menuItemClass,
										'text-red-400 hover:bg-red-500/10'
									)}
									onClick={() => {
										playlistStore.toggleTrackInPlaylist(
											playlistName,
											track.name
										)
										close()
									}}
								>
									<Trash2 size={ICON_SIZE} className="shrink-0" />
									Remove from playlist
								</button>
							</div>
						</>
					)}

					<div className="my-1 border-t border-white/10" />

					{/* Share */}
					<div className="px-1">
						<button
							type="button"
							className={menuItemClass}
							onClick={handleShare}
						>
							<Share2 size={ICON_SIZE} className="shrink-0" />
							Share
						</button>
					</div>

					{/* Remove from queue */}
					{inQueue && (
						<>
							<div className="my-1 border-t border-white/10" />
							<div className="px-1">
								<button
									type="button"
									className={cn(
										menuItemClass,
										'text-red-400 hover:bg-red-500/10'
									)}
									onClick={() => {
										playerStore.removeFromQueue(track.name)
										close()
									}}
								>
									<Trash2 size={ICON_SIZE} className="shrink-0" />
									Remove from queue
								</button>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	)
})
