import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { AlbumCard } from '@/components/ui/album-card/AlbumCard'
import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { ARTISTS } from '@/data/artist.data'
import { TRACKS } from '@/data/tracks.data'

const TRENDING_ARTISTS_LIMIT = 6
const POPULAR_TRACKS_LIMIT = 6

export function DiscoverPage() {
	const trendingArtists = ARTISTS.slice(0, TRENDING_ARTISTS_LIMIT)
	const popularTracks = TRACKS.slice(0, POPULAR_TRACKS_LIMIT)

	const albumsMap = new Map<string, (typeof TRACKS)[number]>()
	TRACKS.forEach(track => {
		if (!albumsMap.has(track.album)) {
			albumsMap.set(track.album, track)
		}
	})
	const albums = Array.from(albumsMap.entries()).slice(0, 6)

	return (
		<PageContainer
			title="Discover"
			breadcrumbs={[
				{ label: 'Home', link: '/' },
				{ label: 'Discover' }
			]}
		>
			<section className="mb-10">
				<h2 className="mb-4 text-xl font-bold">Trending Artists</h2>
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
				<h2 className="mb-4 text-xl font-bold">Popular Albums</h2>
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
				<h2 className="mb-4 text-xl font-bold">Popular Tracks</h2>
				<TrackTable tracks={popularTracks} />
			</section>
		</PageContainer>
	)
}
