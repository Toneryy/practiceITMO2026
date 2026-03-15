import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { ConfirmModal } from '@/components/ui/confirm-modal/ConfirmModal'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { catalogStore } from '@/store/catalog.store'
import { playlistStore } from '@/store/playlist.store'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Calendar,
	Clock,
	Home,
	ImagePlus,
	ListOrdered,
	MoreHorizontal,
	Pencil,
	Play,
	Share2,
	Shuffle,
	Trash2
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import cn from 'clsx'

type SortOption =
	| 'default'
	| 'title-asc'
	| 'title-desc'
	| 'duration-asc'
	| 'duration-desc'
	| 'date-asc'
	| 'date-desc'

const SORT_OPTIONS: { value: SortOption; labelKey: string; icon: typeof ListOrdered }[] = [
	{ value: 'default', labelKey: 'sort.playlistOrder', icon: ListOrdered },
	{ value: 'date-asc', labelKey: 'sort.dateAsc', icon: Calendar },
	{ value: 'date-desc', labelKey: 'sort.dateDesc', icon: Calendar },
	{ value: 'title-asc', labelKey: 'sort.titleAsc', icon: ArrowDownAZ },
	{ value: 'title-desc', labelKey: 'sort.titleDesc', icon: ArrowUpAZ },
	{ value: 'duration-asc', labelKey: 'sort.durationAsc', icon: Clock },
	{ value: 'duration-desc', labelKey: 'sort.durationDesc', icon: Clock }
]

function sortTracks(tracks: ITrack[], sort: SortOption): ITrack[] {
	if (sort === 'default') return tracks
	if (sort === 'date-asc') return tracks
	if (sort === 'date-desc') return [...tracks].reverse()
	const copy = [...tracks]
	const [dir, key] = sort.startsWith('title')
		? [sort === 'title-asc' ? 1 : -1, 'name' as const]
		: [sort === 'duration-asc' ? 1 : -1, 'duration' as const]
	copy.sort((a, b) => {
		const aVal = key === 'name' ? a.name : a.duration
		const bVal = key === 'name' ? b.name : b.duration
		return aVal < bVal ? -dir : aVal > bVal ? dir : 0
	})
	return copy
}

function formatTotalDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	if (h > 0) return `${h} hr ${m} min`
	return `${m} min`
}

export const PlaylistPage = observer(() => {
	const { t } = useTranslation()
	const { id } = useParams()
	const navigate = useNavigate()
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [optionsMenuOpen, setOptionsMenuOpen] = useState(false)
	const [isRenaming, setIsRenaming] = useState(false)
	const [renameValue, setRenameValue] = useState('')
	const [optionsMenuPosition, setOptionsMenuPosition] = useState<{
		top: number
		right: number
	} | null>(null)
	const [sortMenuOpen, setSortMenuOpen] = useState(false)
	const [sortMenuPosition, setSortMenuPosition] = useState<{
		top: number
		right: number
	} | null>(null)
	const [sortBy, setSortBy] = useState<SortOption>('default')
	const coverInputRef = useRef<HTMLInputElement>(null)
	const renameInputRef = useRef<HTMLInputElement>(null)
	const optionsMenuRef = useRef<HTMLDivElement>(null)
	const sortMenuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (isRenaming) renameInputRef.current?.focus()
	}, [isRenaming])

	useLayoutEffect(() => {
		if (!optionsMenuOpen || !optionsMenuRef.current) return
		const rect = optionsMenuRef.current.getBoundingClientRect()
		setOptionsMenuPosition({
			top: rect.bottom + 8,
			right: window.innerWidth - rect.right
		})
		return () => setOptionsMenuPosition(null)
	}, [optionsMenuOpen])

	useLayoutEffect(() => {
		if (!sortMenuOpen || !sortMenuRef.current) return
		const rect = sortMenuRef.current.getBoundingClientRect()
		setSortMenuPosition({
			top: rect.bottom + 8,
			right: window.innerWidth - rect.right
		})
		return () => setSortMenuPosition(null)
	}, [sortMenuOpen])

	useEffect(() => {
		if (!sortMenuOpen) return
		const handleMouseDown = (e: MouseEvent) => {
			const target = e.target as Node
			const inTrigger =
				sortMenuRef.current && sortMenuRef.current.contains(target)
			const inMenu = (target as Element).closest?.('[data-sort-menu]')
			if (!inTrigger && !inMenu) setSortMenuOpen(false)
		}
		document.addEventListener('mousedown', handleMouseDown)
		return () => document.removeEventListener('mousedown', handleMouseDown)
	}, [sortMenuOpen])

	useEffect(() => {
		if (!optionsMenuOpen) return
		const handleMouseDown = (e: MouseEvent) => {
			const target = e.target as Node
			const inTrigger = optionsMenuRef.current?.contains(target)
			const inMenu = (target as Element).closest?.('[data-playlist-options-menu]')
			if (!inTrigger && !inMenu) setOptionsMenuOpen(false)
		}
		document.addEventListener('mousedown', handleMouseDown)
		return () => document.removeEventListener('mousedown', handleMouseDown)
	}, [optionsMenuOpen])

	const playlist = playlistStore.playlists.find(p => p.name === id)

	// Redirect to home if playlist was deleted (e.g. from sidebar) while viewing its page
	useEffect(() => {
		if (!id) return
		if (playlistStore.isLoading) return
		if (!playlist) navigate('/', { replace: true })
	}, [id, playlist, playlistStore.isLoading, navigate])

	// Hooks must run unconditionally — derive from playlist safely with fallbacks
	const tracks = playlist ? catalogStore.tracksByNames(playlist.tracks) : []
	const sortedTracks = useMemo(() => sortTracks(tracks, sortBy), [tracks, sortBy])
	const totalDurationSec = tracks.reduce((sum, t) => sum + t.duration, 0)
	const canReorder = sortBy === 'default' || sortBy === 'date-asc' || sortBy === 'date-desc'

	if (!playlist) {
		return playlistStore.isLoading ? (
			<div className="flex justify-center py-16">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		) : null
	}

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file?.type.startsWith('image/') || !playlist) return
		const reader = new FileReader()
		reader.onload = () => {
			const dataUrl = reader.result as string
			playlistStore.updatePlaylistImage(playlist.name, dataUrl)
		}
		reader.readAsDataURL(file)
		e.target.value = ''
	}

	const handlePlay = () => {
		if (tracks.length === 0) return
		playerStore.setTrack(tracks[0], tracks)
		playerStore.play()
	}

	const handleShuffle = () => {
		if (tracks.length === 0) return
		const shuffled = [...tracks].sort(() => Math.random() - 0.5)
		playerStore.setTrack(shuffled[0], shuffled)
		playerStore.play()
	}

	const handleDeletePlaylist = () => {
		if (!playlist) return
		playlistStore.deletePlaylist(playlist.name)
		setDeleteModalOpen(false)
		navigate('/')
	}

	const handleStartRename = () => {
		setRenameValue(playlist?.name ?? '')
		setIsRenaming(true)
		setOptionsMenuOpen(false)
	}

	const handleSaveRename = () => {
		const trimmed = renameValue.trim()
		if (!playlist || !trimmed || trimmed === playlist.name) {
			setIsRenaming(false)
			return
		}
		if (playlistStore.playlists.some(p => p.name === trimmed && p.name !== playlist.name)) {
			toast.error(t('playlist.renameError'))
			return
		}
		playlistStore.renamePlaylist(playlist.name, trimmed)
		setIsRenaming(false)
		setRenameValue('')
		toast.success(t('sidebar.rename'))
		navigate(`/playlist/${encodeURIComponent(trimmed)}`, { replace: true })
	}

	const handleCancelRename = () => {
		setIsRenaming(false)
		setRenameValue('')
	}

	const handleSharePlaylist = async () => {
		if (!playlist) return
		const url = window.location.href
		const shareData = { title: playlist.name, url }
		try {
			if (navigator.share) {
				await navigator.share(shareData)
				toast.success('Shared')
			} else {
				await navigator.clipboard.writeText(url)
				toast.success('Link copied to clipboard')
			}
		} catch (err) {
			if ((err as Error).name !== 'AbortError') {
				await navigator.clipboard.writeText(url)
				toast.success('Link copied to clipboard')
			}
		}
		setOptionsMenuOpen(false)
	}

	return (
		<PageContainer
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: playlist.name }
			]}
		>
			<div className="mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
				<div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-6">
					<input
						ref={coverInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleCoverChange}
					/>
					<button
						type="button"
						onClick={() => coverInputRef.current?.click()}
						className="group relative h-32 w-32 shrink-0 self-start overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10 hover:ring-white/20 transition-all sm:h-40 sm:w-40 md:h-48 md:w-48"
					>
						{playlist.image ? (
							<img
								src={playlist.image}
								alt=""
								className="h-full w-full object-cover"
							/>
						) : tracks[0]?.cover ? (
							<img
								src={tracks[0].cover}
								alt=""
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-white/40">
								<ImagePlus size={32} className="sm:w-12 sm:h-12" />
							</div>
						)}
						<span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
							<ImagePlus size={32} className="text-white" />
						</span>
					</button>
					<div className="min-w-0 flex-1 w-full">
						{isRenaming ? (
							<div className="mb-2">
								<input
									ref={renameInputRef}
									type="text"
									value={renameValue}
									onChange={e => setRenameValue(e.target.value)}
									onKeyDown={e => {
										if (e.key === 'Enter') handleSaveRename()
										if (e.key === 'Escape') handleCancelRename()
									}}
									onBlur={handleSaveRename}
									className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-lg font-bold text-white outline-none focus:border-primary sm:text-xl md:text-2xl"
								/>
							</div>
						) : (
							<div
								className="group/title flex cursor-pointer items-center gap-2 rounded-lg py-1 pr-2 hover:bg-white/5 transition-colors"
								onClick={handleStartRename}
							>
								<h1 className="truncate text-xl font-bold sm:text-2xl md:text-3xl">{playlist.name}</h1>
								<Pencil
									size={18}
									className="shrink-0 text-white/40 opacity-0 transition-opacity group-hover/title:opacity-100"
								/>
							</div>
						)}
					<div className="text-neutral-400 text-sm mt-1 mb-4 sm:mb-6">
						{t('playlist.tracksCount', { count: tracks.length })} • {formatTotalDuration(totalDurationSec)}
					</div>
						<div className="flex w-full flex-wrap items-center justify-between gap-3">
							<div className="flex items-center gap-2 sm:gap-3">
								<button
									type="button"
									onClick={handlePlay}
									disabled={tracks.length === 0}
									className="rounded-full bg-primary p-3 text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 sm:p-3.5"
								>
									<Play
										size={20}
										fill="currentColor"
										className="sm:w-6 sm:h-6"
									/>
								</button>
								<button
									type="button"
									onClick={handleShuffle}
									disabled={tracks.length === 0}
									className="rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20 disabled:opacity-50 sm:p-3.5"
								>
									<Shuffle size={20} className="sm:w-6 sm:h-6" />
								</button>
							</div>
							<div className="flex items-center gap-2 sm:gap-3">
								{tracks.length > 0 && (
									<div ref={sortMenuRef} className="relative">
										<button
											type="button"
											onClick={() =>
												setSortMenuOpen(prev => !prev)
											}
										className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 sm:px-4 sm:py-2.5"
										title={t('playlist.sortTitle')}
									>
										<ListOrdered size={18} />
										<span className="hidden sm:inline">{t('playlist.sort')}</span>
									</button>
										{sortMenuOpen &&
											sortMenuPosition &&
											createPortal(
												<div
													data-sort-menu
													className="fade-in z-50 min-w-52 rounded-md bg-[#2B2B30] p-1 shadow-xl"
													style={{
														position: 'fixed',
														top: sortMenuPosition.top,
														right: sortMenuPosition.right
													}}
												>
													{SORT_OPTIONS.map(
														({
															value,
															labelKey,
															icon: Icon
														}) => (
															<button
																key={value}
																type="button"
																onClick={() => {
																	setSortBy(value)
																	setSortMenuOpen(
																		false
																	)
																}}
																className={cn(
																	'flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
																	sortBy === value
																		? 'bg-primary/20 text-primary'
																		: 'hover:bg-white/10'
																)}
															>
																<Icon
																	size={16}
																	className="shrink-0 opacity-80"
																/>
																{t(labelKey)}
															</button>
														)
													)}
												</div>,
												document.body
											)}
									</div>
								)}
								<div ref={optionsMenuRef} className="relative">
									<button
										type="button"
										onClick={() =>
											setOptionsMenuOpen(prev => !prev)
										}
								className="flex items-center justify-center rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 sm:p-2.5"
								title={t('playlist.playlistOptions')}
								aria-label={t('playlist.playlistOptions')}
									>
										<MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
									</button>
									{optionsMenuOpen &&
										optionsMenuPosition &&
										createPortal(
											<div
												className="fade-in z-50 w-48 rounded-md bg-[#2B2B30] p-1 shadow-xl"
												style={{
													position: 'fixed',
													top: optionsMenuPosition.top,
													right: optionsMenuPosition.right
												}}
											>
								<button
													type="button"
													onClick={() => {
														handleSharePlaylist()
													}}
													className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
												>
													<Share2 size={16} />
													{t('playlist.share')}
												</button>
												<button
													type="button"
													onClick={() => {
														handleStartRename()
													}}
													className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
												>
													<Pencil size={16} />
													{t('sidebar.rename')}
												</button>
												<button
													type="button"
													onClick={() => {
														setOptionsMenuOpen(false)
														setDeleteModalOpen(true)
													}}
													className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10"
												>
													<Trash2 size={16} />
													{t('playlist.deletePlaylist')}
												</button>
											</div>,
											document.body
										)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

		<ConfirmModal
			open={deleteModalOpen}
			onClose={() => setDeleteModalOpen(false)}
			onConfirm={handleDeletePlaylist}
			title={t('playlist.deleteTitle')}
			confirmLabel={t('playlist.delete')}
			cancelLabel={t('playlist.cancel')}
			variant="danger"
		>
			{t('playlist.deleteConfirm', { name: playlist.name })}
		</ConfirmModal>

		{/* Empty state */}
		{tracks.length === 0 ? (
			<div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-12 text-center sm:px-6 sm:py-16">
				<p className="mb-2 text-white/60">{t('playlist.empty')}</p>
				<p className="mb-6 text-sm text-white/40">
					{t('playlist.emptyDescription')}
				</p>
				<Link
					to="/"
					className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 transition-colors hover:bg-white/20 sm:px-5"
				>
					<Home size={16} />
					{t('playlist.findTracks')}
				</Link>
			</div>
			) : (
				<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
				<TrackTable
						tracks={sortedTracks}
						playlistName={playlist.name}
						onReorder={
							canReorder
								? (oldIndex, newIndex) =>
										playlistStore.reorderTracks(
											playlist.name,
											oldIndex,
											newIndex
										)
								: undefined
						}
				/>
				</div>
			)}
		</PageContainer>
	)
})
