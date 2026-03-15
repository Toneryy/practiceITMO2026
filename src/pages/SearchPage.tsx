import { ExplicitBadge } from '@/components/ui/explicit-badge/ExplicitBadge'
import { catalogStore } from '@/store/catalog.store'
import { playerStore } from '@/store/player.store'
import { favoriteStore } from '@/store/favorite.store'
import type { IArtist } from '@/types/artist.types'
import type { ITrack } from '@/types/track.types'
import cn from 'clsx'
import { Clock, Heart, Mic2, Music, Play, Search } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useMemo, useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreTrack(track: ITrack, q: string): number {
	const name = track.name.toLowerCase()
	const artist = track.artist.name.toLowerCase()
	if (name === q) return 100
	if (name.startsWith(q)) return 85
	if (name.includes(q)) return 65
	if (artist === q) return 55
	if (artist.startsWith(q)) return 45
	if (artist.includes(q)) return 25
	return 0
}

function scoreArtist(artist: IArtist, q: string): number {
	const name = artist.name.toLowerCase()
	if (name === q) return 100
	if (name.startsWith(q)) return 90
	if (name.includes(q)) return 70
	return 0
}

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Large "Top Result" card — can show either an artist or a track */
function TopResultCard({
	track,
	artist,
	onPlay
}: {
	track?: ITrack
	artist?: IArtist
	onPlay: () => void
}) {
	const { t } = useTranslation()
	const navigate = useNavigate()

	if (artist) {
		return (
			<div className="group relative flex h-full flex-col gap-4 rounded-2xl bg-white/5 p-6 transition hover:bg-white/10">
				<img
					src={artist.image}
					alt={artist.name}
					className="h-28 w-28 rounded-full object-cover shadow-xl"
					onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
				/>
				<div>
					<div className="text-2xl font-bold leading-tight">{artist.name}</div>
					<div className="mt-1 text-sm text-white/50">{t('artist.type')}</div>
				</div>
				<button
					type="button"
					onClick={onPlay}
					className="absolute bottom-6 right-6 translate-y-2 rounded-full bg-primary p-4 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
					aria-label={t('sidebar.play')}
				>
					<Play size={20} fill="currentColor" className="text-black" />
				</button>
				<button
					type="button"
					onClick={() => navigate(`/artists/${encodeURIComponent(artist.name)}`)}
					className="absolute inset-0 rounded-2xl"
					aria-label={artist.name}
				/>
			</div>
		)
	}

	if (track) {
		return (
			<div className="group relative flex h-full flex-col gap-4 rounded-2xl bg-white/5 p-6 transition hover:bg-white/10">
				<img
					src={track.cover}
					alt={track.name}
					className="h-28 w-28 rounded-lg object-cover shadow-xl"
				/>
				<div>
					<div className="flex items-center gap-2">
						<span className="text-2xl font-bold leading-tight">{track.name}</span>
						{track.explicit && <ExplicitBadge />}
					</div>
					<div className="mt-1 text-sm text-white/50">
						{track.artist.name} · {t('search.song')}
					</div>
				</div>
				<button
					type="button"
					onClick={onPlay}
					className="absolute bottom-6 right-6 translate-y-2 rounded-full bg-primary p-4 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
					aria-label={t('sidebar.play')}
				>
					<Play size={20} fill="currentColor" className="text-black" />
				</button>
			</div>
		)
	}

	return null
}

/** Compact track row for the Songs section */
function SongRow({ track, index, queue }: { track: ITrack; index: number; queue: ITrack[] }) {
	const { t } = useTranslation()
	const isCurrentTrack = playerStore.currentTrack?.name === track.name
	const isFavorite = favoriteStore.favoritesName.includes(track.name)

	const handlePlay = () => {
		if (isCurrentTrack) {
			playerStore.togglePlayPause()
		} else {
			playerStore.setTrack(track, queue)
			playerStore.play()
		}
	}

	return (
		<div
			className={cn(
				'group grid cursor-pointer items-center gap-4 rounded-md px-4 py-2 transition hover:bg-white/5',
				'grid-cols-[2rem_1fr_auto_auto]',
				isCurrentTrack && 'text-primary'
			)}
			onClick={handlePlay}
		>
			{/* Index / play icon */}
			<div className="flex w-8 shrink-0 items-center justify-center text-sm text-white/40">
				<span className="group-hover:hidden">{isCurrentTrack && playerStore.isPlaying ? '▶' : index + 1}</span>
				<Play
					size={14}
					fill="currentColor"
					className="hidden group-hover:block text-white"
				/>
			</div>

		{/* Cover + name + artist */}
		<div className="flex min-w-0 items-center gap-3">
			<img
				src={track.cover}
				alt={track.name}
				className="h-10 w-10 shrink-0 rounded object-cover"
			/>
			<div className="min-w-0">
				<div className="flex items-center gap-1.5 truncate text-sm font-medium">
					<Link
						to={`/albums/${encodeURIComponent(track.album)}`}
						onClick={e => e.stopPropagation()}
						className={cn('truncate hover:underline', isCurrentTrack ? 'text-primary' : 'text-white')}
					>
						{track.name}
					</Link>
					{track.explicit && <ExplicitBadge />}
				</div>
				<Link
					to={`/artists/${encodeURIComponent(track.artist.name)}`}
					onClick={e => e.stopPropagation()}
					className="truncate block text-xs text-white/50 hover:underline hover:text-white"
				>
					{track.artist.name}
				</Link>
			</div>
		</div>

			{/* Favorite */}
			<button
				type="button"
				onClick={e => {
					e.stopPropagation()
					favoriteStore.toggleFavorite(track.name)
				}}
				className="shrink-0 opacity-0 transition group-hover:opacity-100"
				title={isFavorite ? t('player.removeFromFavorites') : t('player.addToFavorites')}
			>
				<Heart
					size={16}
					className={isFavorite ? 'fill-primary text-primary' : 'text-white/60'}
				/>
			</button>

			{/* Duration */}
			<div className="shrink-0 text-xs text-white/40">
				{formatDuration(track.duration)}
			</div>
		</div>
	)
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export const SearchPage = observer(function SearchPage() {
	const { t } = useTranslation()
	const inputRef = useRef<HTMLInputElement>(null)
	const [searchParams, setSearchParams] = useSearchParams()
	const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '')

	const query = inputValue

	const setQuery = (value: string | null) => {
		setInputValue(value ?? '')
		const next = new URLSearchParams(searchParams)
		if (value) next.set('q', value)
		else next.delete('q')
		setSearchParams(next, { replace: true })
	}

	// Sync input when URL changes externally (e.g. browser back)
	useEffect(() => {
		setInputValue(searchParams.get('q') ?? '')
	}, [searchParams])

	// Auto-focus the input when the page mounts
	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	const q = query.trim().toLowerCase()
	const hasQuery = q.length > 0

	// Ranked results
	const { topArtist, topTrack, rankedTracks, matchedArtists } = useMemo(() => {
		if (!hasQuery) {
			return { topArtist: null, topTrack: null, rankedTracks: [], matchedArtists: [] }
		}

		const mArtists = catalogStore.artists
			.map(a => ({ artist: a, score: scoreArtist(a, q) }))
			.filter(x => x.score > 0)
			.sort((a, b) => b.score - a.score)

		const mTracks = catalogStore.tracks
			.map(t => ({ track: t, score: scoreTrack(t, q) }))
			.filter(x => x.score >= 30)
			.sort((a, b) => b.score - a.score)

		// Top result: artist wins if its score ≥ top track's score
		const bestArtistScore = mArtists[0]?.score ?? 0
		const bestTrackScore = mTracks[0]?.score ?? 0

		const tArtist = bestArtistScore >= bestTrackScore ? (mArtists[0]?.artist ?? null) : null
		const tTrack = !tArtist ? (mTracks[0]?.track ?? null) : null

		return {
			topArtist: tArtist,
			topTrack: tTrack,
			rankedTracks: mTracks.map(x => x.track),
			matchedArtists: mArtists.map(x => x.artist)
		}
	}, [q, catalogStore.tracks.length, catalogStore.artists.length])

	const songsQueue = rankedTracks.slice(0, 5)
	const hasResults = rankedTracks.length > 0 || matchedArtists.length > 0

	const handleTopPlay = () => {
		if (topArtist) {
			const artistTracks = catalogStore.tracks.filter(
				t => t.artist.name === topArtist.name
			)
			if (artistTracks.length > 0) {
				playerStore.setTrack(artistTracks[0], artistTracks)
				playerStore.play()
			}
		} else if (topTrack) {
			playerStore.setTrack(topTrack, rankedTracks)
			playerStore.play()
		}
	}

	return (
		<div className="mx-auto w-full max-w-5xl px-layout pb-10 pt-8">
			{/* Search input */}
			<div className="mb-8">
				<label className="flex items-center gap-3 rounded-full border border-transparent bg-white/5 px-5 py-3 text-base duration-300 focus-within:border-primary/50 focus-within:bg-white/10 group">
					<Search
						size={22}
						className="shrink-0 text-white/40 duration-300 group-focus-within:text-white"
					/>
					<input
						ref={inputRef}
						type="search"
						value={query}
						onChange={e => setQuery(e.target.value || null)}
						placeholder={t('search.placeholder')}
						className="w-full bg-transparent text-base outline-none placeholder:text-white/20"
					/>
					{query && (
						<button
							type="button"
							onClick={() => setQuery(null)}
							className="shrink-0 text-white/40 hover:text-white"
							aria-label="Clear"
						>
							✕
						</button>
					)}
				</label>
			</div>

			{/* Empty state */}
			{!hasQuery && (
				<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
						<Search size={36} className="text-white/30" />
					</div>
					<div>
						<p className="text-xl font-bold">{t('search.emptyTitle')}</p>
						<p className="mt-1 text-sm text-white/50">{t('search.emptySubtitle')}</p>
					</div>
				</div>
			)}

			{/* No results */}
			{hasQuery && !hasResults && (
				<div className="flex flex-col items-center gap-4 py-24 text-center">
					<Music size={48} className="text-white/20" />
					<div>
						<p className="text-xl font-bold">{t('search.noResults', { query })}</p>
						<p className="mt-1 text-sm text-white/50">{t('search.noResultsHint')}</p>
					</div>
				</div>
			)}

			{/* Results */}
			{hasQuery && hasResults && (
				<div className="space-y-10">
					{/* Top result + Songs row */}
					<div className="grid grid-cols-[minmax(240px,1fr)_2fr] gap-6">
						{/* Top result */}
						{(topArtist || topTrack) && (
							<div className="flex flex-col gap-3">
								<h2 className="text-xl font-bold">{t('search.topResult')}</h2>
								<TopResultCard
									artist={topArtist ?? undefined}
									track={topTrack ?? undefined}
									onPlay={handleTopPlay}
								/>
							</div>
						)}

						{/* Songs */}
						{songsQueue.length > 0 && (
							<div className="flex min-w-0 flex-col gap-3">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-bold">{t('search.songs')}</h2>
									<Clock size={14} className="text-white/30" />
								</div>
								<div className="flex flex-col">
									{songsQueue.map((track, i) => (
										<SongRow
											key={track.name}
											track={track}
											index={i}
											queue={rankedTracks}
										/>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Artists */}
					{matchedArtists.length > 0 && (
						<section>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-xl font-bold">{t('search.artists')}</h2>
								<Mic2 size={16} className="text-white/30" />
							</div>
							<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
								{matchedArtists.slice(0, 6).map(artist => (
									<Link
										key={artist.name}
										to={`/artists/${encodeURIComponent(artist.name)}`}
										className="group flex flex-col items-center gap-3 rounded-xl p-4 transition hover:bg-white/5"
									>
										{artist.image ? (
											<img
												key={artist.image}
												src={artist.image}
												alt={artist.name}
												className="h-28 w-28 rounded-full object-cover shadow-lg transition group-hover:brightness-90"
												onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
											/>
										) : (
											<div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-4xl font-bold">
												{artist.name.charAt(0)}
											</div>
										)}
										<div className="text-center">
											<div className="font-semibold">{artist.name}</div>
											<div className="text-xs text-white/40">
												{(artist.listenersCount ?? 0).toLocaleString()} {t('search.listeners')}
											</div>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}

					{/* More songs (if > 5) */}
					{rankedTracks.length > 5 && (
						<section>
							<h2 className="mb-4 text-xl font-bold">{t('search.allSongs')}</h2>
							<div className="flex flex-col">
								{rankedTracks.slice(5).map((track, i) => (
									<SongRow
										key={track.name}
										track={track}
										index={i + 5}
										queue={rankedTracks}
									/>
								))}
							</div>
						</section>
					)}
				</div>
			)}
		</div>
	)
})
