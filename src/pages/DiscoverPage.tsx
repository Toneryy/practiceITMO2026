import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { AlbumCard } from '@/components/ui/album-card/AlbumCard'
import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { catalogStore } from '@/store/catalog.store'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

const TRENDING_ARTISTS_LIMIT = 6
const POPULAR_TRACKS_LIMIT = 6

export const DiscoverPage = observer(function DiscoverPage() {
	const { t } = useTranslation()
	const trendingArtists = catalogStore.artists.slice(0, TRENDING_ARTISTS_LIMIT)
	const popularTracks = catalogStore.tracks.slice(0, POPULAR_TRACKS_LIMIT)
	const albums = Array.from(catalogStore.albums.entries()).slice(0, 6)

	return (
		<PageContainer
			title={t('discover.title')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('discover.title') }
			]}
		>
			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">{t('discover.trendingArtists')}</h2>
				<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
					{trendingArtists.map(artist => (
						<ArtistCard
							key={artist.name}
							artist={artist}
						/>
					))}
				</div>
			</section>

			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">{t('discover.popularAlbums')}</h2>
				<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
					{albums.map(([album, track]) => (
						<AlbumCard
							key={album}
							album={album}
							cover={track.cover}
							artist={track.artist.name}
						/>
					))}
				</div>
			</section>

			<section>
				<h2 className="mb-4 text-xl font-bold">{t('discover.popularTracks')}</h2>
				<TrackTable tracks={popularTracks} />
			</section>
		</PageContainer>
	)
})
