import { ExplicitBadge } from '@/components/ui/explicit-badge/ExplicitBadge'
import { PagesConfig } from '@/config/pages.config'
import { playlistStore } from '@/store/playlist.store'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import {
	ChevronRight,
	Clock,
	Disc,
	Info,
	Link2,
	ListMusic,
	MoreHorizontal,
	Plus,
	Quote,
	Radio,
	Search,
	Share2,
	Trash2,
	User,
	X
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import cn from 'clsx'

// ---------------------------------------------------------------------------
// Track Details Modal
// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}

function TrackDetailsModal({ track, onClose }: { track: ITrack; onClose: () => void }) {
	// Close on Escape
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [onClose])

	return createPortal(
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="fade-in relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-[#1e1e28] shadow-2xl"
				onClick={e => e.stopPropagation()}
			>
				{/* Cover */}
				<div className="relative">
					<img
						src={track.cover}
						alt={track.name}
						className="h-64 w-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-[#1e1e28] via-[#1e1e28]/20 to-transparent" />
					<button
						type="button"
						onClick={onClose}
						className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white/70 hover:text-white"
					>
						<X size={18} />
					</button>
				</div>

				{/* Info */}
				<div className="flex flex-col gap-4 p-5 pt-3">
					<div>
						<div className="flex items-center gap-2">
							<h2 className="text-xl font-bold leading-tight">{track.name}</h2>
							{track.explicit && <ExplicitBadge />}
						</div>
						<p className="mt-0.5 text-sm text-white/60">{track.artist.name}</p>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-0.5 rounded-xl bg-white/5 p-3">
							<span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white/40">
								<Disc size={12} /> Album
							</span>
							<span className="truncate text-sm font-medium">{track.album || '—'}</span>
						</div>
						<div className="flex flex-col gap-0.5 rounded-xl bg-white/5 p-3">
							<span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white/40">
								<Clock size={12} /> Duration
							</span>
							<span className="text-sm font-medium">{formatDuration(track.duration)}</span>
						</div>
						<div className="flex flex-col gap-0.5 rounded-xl bg-white/5 p-3">
							<span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white/40">
								<User size={12} /> Artist
							</span>
							<span className="truncate text-sm font-medium">{track.artist.name}</span>
						</div>
						<div className="flex flex-col gap-0.5 rounded-xl bg-white/5 p-3">
							<span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-white/40">
								<User size={12} /> Listeners
							</span>
							<span className="text-sm font-medium">
								{track.artist.listenersCount.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}

const MENU_WIDTH = 240
const SUBMENU_WIDTH = 220
const ICON_SIZE = 18

// Mobile options modal — full-screen overlay with scrollable content
function OptionsModal({
	track,
	playlistName,
	inQueue,
	onClose,
	menuItemClass,
	onAddToQueue,
	onPlayNext,
	onGoToArtist,
	onGoToAlbum,
	onShowLyrics,
	onAddToPlaylist,
	onViewDetails,
	onRemoveFromPlaylist,
	onShare,
	onRemoveFromQueue,
	ICON_SIZE: iconSize
}: {
	track: ITrack
	playlistName?: string | null
	inQueue?: boolean
	onClose: () => void
	menuItemClass: string
	onAddToQueue: () => void
	onPlayNext: () => void
	onGoToArtist: () => void
	onGoToAlbum: () => void
	onShowLyrics: () => void
	onAddToPlaylist: () => void
	onViewDetails: () => void
	onRemoveFromPlaylist?: () => void
	onShare: () => void
	onRemoveFromQueue?: () => void
	ICON_SIZE: number
}) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [onClose])

	return createPortal(
		<div
			className="fixed inset-0 z-[9999] flex flex-col items-center justify-end bg-black/70 p-4 sm:justify-center"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="fade-in flex w-full max-w-sm flex-col overflow-hidden rounded-t-2xl bg-[#282828] py-2 shadow-2xl sm:rounded-2xl sm:max-h-[85vh]"
				onClick={e => e.stopPropagation()}
			>
				<div className="scrollbar-custom max-h-[70vh] overflow-y-auto py-1 sm:max-h-[60vh]">
					<button className={menuItemClass} onClick={onAddToQueue}>
						<ListMusic size={iconSize} className="shrink-0" />
						Add to Queue
					</button>
					<button className={menuItemClass} onClick={onPlayNext}>
						<Plus size={iconSize} className="shrink-0" />
						Play Next
					</button>
					<div className="my-1 border-t border-white/10" />
					<button className={menuItemClass} onClick={onGoToArtist}>
						<User size={iconSize} className="shrink-0" />
						Go to Artist
					</button>
					<button className={menuItemClass} onClick={onGoToAlbum}>
						<Disc size={iconSize} className="shrink-0" />
						Go to Album
					</button>
					<div className="my-1 border-t border-white/10" />
					<button className={menuItemClass} onClick={onShowLyrics}>
						<Quote size={iconSize} className="shrink-0" />
						Show Lyrics
					</button>
					<div className="my-1 border-t border-white/10" />
					<button className={menuItemClass} onClick={onAddToPlaylist}>
						<Plus size={iconSize} className="shrink-0" />
						Add to Playlist
					</button>
					<div className="my-1 border-t border-white/10" />
					<button className={menuItemClass} onClick={onViewDetails}>
						<Info size={iconSize} className="shrink-0" />
						View details
					</button>
					{playlistName && onRemoveFromPlaylist && (
						<>
							<div className="my-1 border-t border-white/10" />
							<button className={cn(menuItemClass, 'text-red-400 hover:bg-red-500/10')} onClick={onRemoveFromPlaylist}>
								<Trash2 size={iconSize} className="shrink-0" />
								Remove from playlist
							</button>
						</>
					)}
					<div className="my-1 border-t border-white/10" />
					<button className={menuItemClass} onClick={onShare}>
						<Share2 size={iconSize} className="shrink-0" />
						Share
					</button>
					{inQueue && onRemoveFromQueue && (
						<>
							<div className="my-1 border-t border-white/10" />
							<button className={cn(menuItemClass, 'text-red-400 hover:bg-red-500/10')} onClick={onRemoveFromQueue}>
								<Trash2 size={iconSize} className="shrink-0" />
								Remove from queue
							</button>
						</>
					)}
				</div>
			</div>
		</div>,
		document.body
	)
}

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
	const [detailsOpen, setDetailsOpen] = useState(false)
	const [submenuPos, setSubmenuPos] = useState<{ top: number; left: number } | null>(null)
	const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
	const [isMobile, setIsMobile] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const menuPortalRef = useRef<HTMLDivElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)
	const submenuRef = useRef<HTMLDivElement | null>(null)
	const submenuTriggerRef = useRef<HTMLDivElement>(null)
	const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const navigate = useNavigate()

	// Mobile detection (sm: 640px)
	useEffect(() => {
		const mq = window.matchMedia('(max-width: 639px)')
		setIsMobile(mq.matches)
		const handler = () => setIsMobile(mq.matches)
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [])

	// Compute main menu portal position (desktop)
	useLayoutEffect(() => {
		if (!open || isMobile || !triggerRef.current) return
		const rect = triggerRef.current.getBoundingClientRect()
		const top = rect.bottom + 4
		const right = window.innerWidth - rect.right
		setMenuPos({ top, right })
	}, [open, isMobile])

	// Lock body scroll when menu/modal open
	useEffect(() => {
		if (!open) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => { document.body.style.overflow = prev }
	}, [open])

	// Compute submenu portal position whenever it opens
	useLayoutEffect(() => {
		if (!addToPlaylistOpen || !submenuTriggerRef.current) return
		const rect = submenuTriggerRef.current.getBoundingClientRect()
		const left = rect.left - SUBMENU_WIDTH - 4
		// start aligned with the trigger row, clamp so it doesn't overflow bottom
		const maxTop = window.innerHeight - 320 // 320 ≈ submenu max height
		const top = Math.min(rect.top, maxTop)
		setSubmenuPos({ top, left: Math.max(4, left) })
	}, [addToPlaylistOpen])

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
			const target = e.target as Node
			const insideTrigger = menuRef.current?.contains(target)
			const insideMenu = menuPortalRef.current?.contains(target)
			const insideSubmenu = submenuRef.current?.contains(target)
			if (!insideTrigger && !insideMenu && !insideSubmenu) {
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
		setSubmenuPos(null)
		setMenuPos(null)
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
		const url =
			`${window.location.origin}/search?q=${encodeURIComponent(track.name)}`
		try {
			await navigator.clipboard.writeText(url)
			toast.success('Ссылка скопирована', {
				description: url,
				icon: <Link2 size={16} style={{ color: 'var(--color-primary)' }} />
			})
		} catch {
			// Clipboard API unavailable (e.g. non-HTTPS) — show the URL in a toast
			toast('Скопируй ссылку вручную', {
				description: url,
				duration: 8000,
				icon: <Link2 size={16} style={{ color: 'var(--color-primary)' }} />
			})
		}
		close()
	}

	const handleCreatePlaylist = async () => {
		const name = window.prompt('Playlist name', 'New Playlist')?.trim()
		if (name) {
			const success = await playlistStore.createPlaylist(name)
			if (success) {
				playlistStore.toggleTrackInPlaylist(name, track.name)
				setAddToPlaylistOpen(false)
			}
		}
	}

	const menuItemClass =
		'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 transition-colors'

	return (
		<>
		<div className="relative" ref={menuRef}>
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setOpen(prev => !prev)}
				className="rounded-md p-1.5 text-white/40 transition-opacity hover:text-white"
				title="Options"
			>
				<MoreHorizontal size={20} />
			</button>

			{/* Mobile: modal with options */}
			{open && isMobile && (
				<OptionsModal
					track={track}
					playlistName={playlistName}
					inQueue={inQueue}
					onClose={close}
					menuItemClass={menuItemClass}
					ICON_SIZE={ICON_SIZE}
					onAddToQueue={() => { playerStore.addToQueue(track); toast('Added to queue', { icon: <ListMusic size={18} style={{ color: 'var(--color-primary)' }} /> }); close() }}
					onPlayNext={() => { playerStore.playNext(track); toast('Will play next'); close() }}
					onGoToArtist={() => { navigate(PagesConfig.ARTISTS(encodeURIComponent(track.artist.name))); close() }}
					onGoToAlbum={() => { navigate(PagesConfig.ALBUMS(encodeURIComponent(track.album))); close() }}
					onShowLyrics={handleShowLyrics}
					onAddToPlaylist={() => { close(); /* simplified on mobile: open playlist picker could be added */ }}
					onViewDetails={() => { setDetailsOpen(true); close() }}
					onRemoveFromPlaylist={playlistName ? () => { playlistStore.toggleTrackInPlaylist(playlistName, track.name); close() } : undefined}
					onShare={handleShare}
					onRemoveFromQueue={inQueue ? () => { playerStore.removeFromQueue(track.name); close() } : undefined}
				/>
			)}

			{/* Desktop: dropdown via portal (fixed, no page scroll) */}
			{open && !isMobile && menuPos && createPortal(
				<div
					ref={menuPortalRef}
					className="fade-in fixed z-[9998] max-h-[min(70vh,400px)] overflow-y-auto rounded-md bg-[#282828] py-1.5 shadow-xl"
					style={{ width: MENU_WIDTH, top: menuPos.top, right: menuPos.right }}
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

				{/* Section 4: Add to Playlist (submenu rendered via portal) */}
				<div
					ref={submenuTriggerRef}
					className="px-1"
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
						onClick={() => setAddToPlaylistOpen(prev => !prev)}
					>
						<span className="flex items-center gap-2">
							<Plus size={ICON_SIZE} className="shrink-0" />
							Add to Playlist
						</span>
						<ChevronRight size={ICON_SIZE} className="shrink-0" />
					</button>
				</div>

				{addToPlaylistOpen && submenuPos &&
					createPortal(
						<div
							ref={submenuRef}
							className="fade-in fixed z-[9999] rounded-md bg-[#282828] py-1.5 shadow-xl"
							style={{ width: `${SUBMENU_WIDTH}px`, top: submenuPos.top, left: submenuPos.left }}
							onMouseEnter={() => {
								if (submenuTimeoutRef.current) {
									clearTimeout(submenuTimeoutRef.current)
									submenuTimeoutRef.current = null
								}
							}}
							onMouseLeave={() => {
								submenuTimeoutRef.current = setTimeout(() => {
									setAddToPlaylistOpen(false)
									submenuTimeoutRef.current = null
								}, 150)
							}}
						>
							{/* Search */}
							<div className="px-2 pb-1.5">
								<div className="flex items-center gap-2 rounded-md bg-white/10 px-2 py-1.5">
									<Search size={ICON_SIZE} className="shrink-0 text-white/50" />
									<input
										type="text"
										placeholder="Search playlist"
										value={playlistSearch}
										onChange={e => setPlaylistSearch(e.target.value)}
										className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
									/>
								</div>
							</div>

							{/* Create playlist */}
							<button
								type="button"
								className={cn(menuItemClass, 'mx-1 flex items-center gap-2')}
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
										{playlistSearch.trim() ? 'No results' : 'No playlists'}
									</div>
								) : (
									filteredPlaylists.map(pl => {
										const isIn = playlistStore.isTrackInPlaylist(pl.name, track.name)
										return (
											<button
												key={pl.name}
												type="button"
												onClick={() => {
													playlistStore.toggleTrackInPlaylist(pl.name, track.name)
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
						</div>,
						document.body
					)
				}

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
						onClick={() => { setDetailsOpen(true); close() }}
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

		{detailsOpen && (
			<TrackDetailsModal
				track={track}
				onClose={() => setDetailsOpen(false)}
			/>
		)}
		</>
	)
})
