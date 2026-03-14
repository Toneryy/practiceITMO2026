import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { useDecodedParam } from '@/hooks/useDecodedParam'
import { catalogStore } from '@/store/catalog.store'
import { playerStore } from '@/store/player.store'
import { subscriptionStore } from '@/store/subscription.store'
import type { ITrack } from '@/types/track.types'
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Calendar,
	Clock,
	ListOrdered,
	MoreHorizontal,
	Play,
	Share2,
	Shuffle
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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
	{ value: 'default', labelKey: 'sort.default', icon: ListOrdered },
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

export const ArtistPage = observer(function ArtistPage() {
	const { t } = useTranslation()
	const decodedName = useDecodedParam('name')
	const [imageError, setImageError] = useState(false)
	const [sortBy, setSortBy] = useState<SortOption>('default')
	const [sortMenuOpen, setSortMenuOpen] = useState(false)
	const [sortMenuPosition, setSortMenuPosition] = useState<{
		top: number
		right: number
	} | null>(null)
	const [optionsMenuOpen, setOptionsMenuOpen] = useState(false)
	const [optionsMenuPosition, setOptionsMenuPosition] = useState<{
		top: number
		right: number
	} | null>(null)
	const optionsMenuRef = useRef<HTMLDivElement>(null)
	const sortMenuRef = useRef<HTMLDivElement>(null)

	// Fetch the artist with their tracks from the API
	useEffect(() => {
		catalogStore.fetchArtistByName(decodedName)
	}, [decodedName])

	const artist = catalogStore.currentArtist
	const topTracks = artist?.tracks ?? []

	const sortedTracks = useMemo(
		() => sortTracks(topTracks, sortBy),
		[topTracks, sortBy]
	)

	const totalDurationSec = topTracks.reduce((sum, t) => sum + t.duration, 0)

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
			if (
				optionsMenuRef.current &&
				!optionsMenuRef.current.contains(e.target as Node)
			) {
				setOptionsMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', handleMouseDown)
		return () => document.removeEventListener('mousedown', handleMouseDown)
	}, [optionsMenuOpen])

	const handlePlay = () => {
		if (topTracks.length === 0) return
		playerStore.setTrack(topTracks[0], topTracks)
		playerStore.play()
	}

	const handleShuffle = () => {
		if (topTracks.length === 0) return
		const shuffled = [...topTracks].sort(() => Math.random() - 0.5)
		playerStore.setTrack(shuffled[0], shuffled)
		playerStore.play()
	}

	const handleShareArtist = async () => {
		if (!artist) return
		const url = window.location.href
		const shareData = { title: artist.name, url }
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

	// Loading state
	if (catalogStore.isLoadingArtist) {
		return (
			<PageContainer
				breadcrumbs={[
					{ label: t('nav.home'), link: '/' },
					{ label: t('nav.artists'), link: '/artists' }
				]}
			>
				<div className="flex items-center justify-center py-24">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			</PageContainer>
		)
	}

	if (!artist) {
		return (
			<PageContainer
				title={t('artist.notFound')}
				breadcrumbs={[
					{ label: t('nav.home'), link: '/' },
					{ label: t('nav.artists'), link: '/artists' }
				]}
			>
				<Link to="/artists" className="text-primary hover:underline">
					{t('artist.backToArtists')}
				</Link>
			</PageContainer>
		)
	}

	return (
		<PageContainer
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('nav.artists'), link: '/artists' },
				{ label: artist.name }
			]}
		>
			{/* Artist Header */}
			<div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end">
				{!artist.image || imageError ? (
					<div
						className="flex h-48 w-48 shrink-0 items-center justify-center rounded-full bg-primary/20 text-7xl font-bold text-primary shadow-xl sm:h-56 sm:w-56"
						aria-hidden
					>
						{artist.name.charAt(0).toUpperCase()}
					</div>
				) : (
					<img
						src={artist.image}
						alt={artist.name}
						className="h-48 w-48 shrink-0 rounded-full object-cover shadow-xl sm:h-56 sm:w-56"
						onError={() => setImageError(true)}
					/>
				)}
				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium uppercase tracking-wide text-neutral-400">
						{t('artist.type')}
					</p>
					<h1 className="text-4xl font-bold sm:text-5xl">{artist.name}</h1>
					<p className="mt-1 text-sm text-neutral-400">
						{artist.listenersCount.toLocaleString()} listeners •{' '}
						{topTracks.length} tracks • {formatTotalDuration(totalDurationSec)}
					</p>
					<div className="mt-4 flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={handlePlay}
							disabled={topTracks.length === 0}
							className="rounded-full bg-primary p-3.5 text-black transition-transform hover:scale-105 disabled:opacity-50"
						>
							<Play size={24} fill="currentColor" />
						</button>
						<button
							type="button"
							onClick={handleShuffle}
							disabled={topTracks.length === 0}
							className="rounded-full bg-white/10 p-3.5 hover:bg-white/20 transition-colors disabled:opacity-50"
						>
							<Shuffle size={24} />
						</button>
						<button
							type="button"
							onClick={() =>
								subscriptionStore.toggleSubscribe(artist.name)
							}
							className={cn(
								'rounded-full px-8 py-2.5 text-sm font-semibold transition-colors min-w-[120px]',
								subscriptionStore.isSubscribed(artist.name)
									? 'bg-white/20 text-white hover:bg-white/30'
									: 'bg-white/10 text-white hover:bg-white/20'
							)}
						>
							{subscriptionStore.isSubscribed(artist.name)
								? t('artist.subscribed')
								: t('artist.subscribe')}
						</button>
						<div className="flex items-center gap-3">
							{topTracks.length > 0 && (
								<div ref={sortMenuRef} className="relative">
									<button
										type="button"
										onClick={() =>
											setSortMenuOpen(prev => !prev)
										}
										className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white/80 hover:bg-white/20 transition-colors"
										title={t('artist.sortTitle')}
									>
										<ListOrdered size={18} />
										<span>{t('artist.sort')}</span>
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
																setSortMenuOpen(false)
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
									className="flex items-center justify-center rounded-full bg-white/10 p-2.5 text-white/80 hover:bg-white/20 transition-colors"
									title={t('artist.artistOptions')}
									aria-label={t('artist.artistOptions')}
								>
									<MoreHorizontal size={20} />
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
												onClick={() => handleShareArtist()}
												className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
											>
												<Share2 size={16} />
												{t('artist.share')}
											</button>
										</div>,
										document.body
									)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Top Tracks */}
			<section>
				<h2 className="mb-4 text-xl font-bold">{t('artist.topTracks')}</h2>
				{topTracks.length === 0 ? (
					<p className="text-neutral-400">{t('artist.noTracks')}</p>
				) : (
					<TrackTable tracks={sortedTracks} />
				)}
			</section>
		</PageContainer>
	)
})
