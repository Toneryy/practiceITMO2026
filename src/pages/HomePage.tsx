import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { catalogStore } from '@/store/catalog.store'
import { playerStore } from '@/store/player.store'
import { Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const POPULAR_LIMIT = 6
const ARTISTS_LIMIT = 6

export const HomePage = observer(function HomePage() {
	const { t } = useTranslation()

	useEffect(() => {
		if (catalogStore.tracks.length === 0) catalogStore.fetchTracks()
		if (catalogStore.artists.length === 0) catalogStore.fetchArtists()
	}, [])

	const popularTracks = catalogStore.tracks.slice(0, POPULAR_LIMIT)
	const featuredArtists = catalogStore.artists.slice(0, ARTISTS_LIMIT)
	const isLoading = catalogStore.isLoadingTracks || catalogStore.isLoadingArtists

	// Featured artist: most-listened from the catalog
	const featuredArtist = catalogStore.artists.reduce<typeof catalogStore.artists[number] | null>(
		(best, a) => (!best || a.listenersCount > best.listenersCount ? a : best),
		null
	)
	const featuredArtistTracks = featuredArtist
		? catalogStore.tracks.filter(t => t.artist.name === featuredArtist.name)
		: []

	const navigate = useNavigate()

	const handleFeaturedPlay = () => {
		if (featuredArtistTracks.length === 0) return
		playerStore.setTrack(featuredArtistTracks[0], featuredArtistTracks)
		playerStore.play()
	}

	return (
		<PageContainer>
			{/* Featured artist banner */}
			{isLoading || !featuredArtist ? (
				<div className="h-16 w-full animate-pulse rounded-xl bg-white/5 sm:h-20" />
			) : (
				<div className="grid w-full min-h-[100px] grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-gradient-to-br from-[#3d2c5c] via-[#2d2d44] to-[#1a1a2e] p-4 sm:min-h-[120px] sm:gap-6 sm:p-6 md:min-h-[140px] md:gap-8 md:p-8 lg:min-h-[160px] lg:rounded-2xl">
					<div className="flex min-w-0 items-center gap-3 overflow-hidden sm:gap-5 md:gap-6">
						{featuredArtist.image ? (
							<img
								key={featuredArtist.image}
								src={featuredArtist.image}
								alt={featuredArtist.name}
								className="h-12 w-12 shrink-0 cursor-pointer rounded-full object-cover shadow-lg transition hover:brightness-90 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28"
								onClick={() => navigate(`/artists/${encodeURIComponent(featuredArtist.name)}`)}
								onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
							/>
						) : (
							<div
								className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary shadow-lg sm:h-20 sm:w-20 sm:text-3xl md:h-24 md:w-24 md:text-4xl lg:h-28 lg:w-28 lg:text-5xl"
								onClick={() => navigate(`/artists/${encodeURIComponent(featuredArtist.name)}`)}
							>
								{featuredArtist.name.charAt(0).toUpperCase()}
							</div>
						)}
						<div className="min-w-0 flex-1">
							<p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/50 sm:text-xs md:mb-1.5 md:text-sm">
								{t('home.featuredArtist')}
							</p>
							<h1
								className="cursor-pointer truncate text-sm font-semibold text-white hover:underline sm:text-lg md:text-xl lg:text-2xl"
								onClick={() => navigate(`/artists/${encodeURIComponent(featuredArtist.name)}`)}
							>
								{featuredArtist.name}
							</h1>
							<h2 className="truncate text-xs text-primary font-medium sm:text-sm md:text-base">
								{featuredArtist.listenersCount.toLocaleString()} listeners
							</h2>
						</div>
					</div>
					<button
						onClick={handleFeaturedPlay}
						disabled={featuredArtistTracks.length === 0}
						className="flex shrink-0 items-center justify-center self-center rounded-full border border-player-bg bg-gradient-to-r from-[#2F3034] to-[#1F2026] p-2.5 duration-300 hover:translate-y-[-2px] hover:shadow disabled:opacity-40 sm:p-4 md:p-5"
					>
						<Play
							className="text-primary"
							fill="var(--color-primary)"
						/>
					</button>
				</div>
			)}

			{isLoading ? (
				<div className="mt-10 flex items-center justify-center py-16">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : (
				<>
					<section className="mt-6 sm:mt-8">
						<h2 className="mb-2 text-base font-bold sm:mb-3 sm:text-lg">{t('home.popularTracks')}</h2>
						<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
							<TrackTable tracks={popularTracks} />
						</div>
					</section>

					<section className="mt-8 sm:mt-10">
						<h2 className="mb-2 text-base font-bold sm:mb-3 sm:text-lg">{t('home.artists')}</h2>
						<div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6">
							{featuredArtists.map(artist => (
								<ArtistCard
									key={artist.name}
									artist={artist}
								/>
							))}
						</div>
					</section>

					<section className="mt-8 sm:mt-10">
						<h2 className="mb-2 text-base font-bold sm:mb-3 sm:text-lg">{t('home.allTracks')}</h2>
						<div className="mt-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:mt-5 sm:px-0">
							<TrackTable tracks={catalogStore.tracks} />
						</div>
					</section>
				</>
			)}
		</PageContainer>
	)
})
