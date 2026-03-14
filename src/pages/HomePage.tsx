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
				<div className="h-40 w-full animate-pulse rounded-xl bg-white/5" />
			) : (
				<div className="flex w-full items-end gap-6 rounded-xl bg-gradient-to-br from-[#3d2c5c] via-[#2d2d44] to-[#1a1a2e] p-6 pb-8">
					{featuredArtist.image ? (
						<img
							src={featuredArtist.image}
							alt={featuredArtist.name}
							className="h-40 w-40 shrink-0 cursor-pointer rounded-full object-cover shadow-2xl transition hover:brightness-90"
							onClick={() => navigate(`/artists/${encodeURIComponent(featuredArtist.name)}`)}
						/>
					) : (
						<div
							className="flex h-40 w-40 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary/20 text-6xl font-bold text-primary shadow-2xl"
							onClick={() => navigate(`/artists/${encodeURIComponent(featuredArtist.name)}`)}
						>
							{featuredArtist.name.charAt(0).toUpperCase()}
						</div>
					)}
					<div className="min-w-0 flex-1">
						<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/50">
							{t('home.featuredArtist')}
						</p>
						<h1
							className="cursor-pointer text-2xl font-semibold text-white hover:underline"
							onClick={() => navigate(`/artists/${encodeURIComponent(featuredArtist.name)}`)}
						>
							{featuredArtist.name}
						</h1>
						<h2 className="mt-0.5 text-sm text-primary font-medium">
							{featuredArtist.listenersCount.toLocaleString()} listeners
						</h2>
					</div>
					<button
						onClick={handleFeaturedPlay}
						disabled={featuredArtistTracks.length === 0}
						className="shrink-0 rounded-full bg-gradient-to-r from-[#2F3034] to-[#1F2026] p-5 border border-player-bg border-solid duration-300 hover:translate-y-[-2px] hover:shadow disabled:opacity-40"
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
					<section className="mt-8">
						<h2 className="text-xl font-bold mb-4">{t('home.popularTracks')}</h2>
						<TrackTable tracks={popularTracks} />
					</section>

					<section className="mt-10">
						<h2 className="text-xl font-bold mb-4">{t('home.artists')}</h2>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
							{featuredArtists.map(artist => (
								<ArtistCard
									key={artist.name}
									artist={artist}
								/>
							))}
						</div>
					</section>

					<section className="mt-10">
						<h2 className="text-xl font-bold mb-4">{t('home.allTracks')}</h2>
						<div className="mt-5">
							<TrackTable tracks={catalogStore.tracks} />
						</div>
					</section>
				</>
			)}
		</PageContainer>
	)
})
