import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { SearchField } from '@/components/elements/search-field/SearchField'
import { Track } from '@/components/elements/track-item/Track'
import { ARTISTS } from '@/data/artist.data'
import { TRACKS } from '@/data/tracks.data'
import { Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useQueryState } from 'nuqs'
import { useMemo } from 'react'

const POPULAR_LIMIT = 6
const ARTISTS_LIMIT = 6

export const HomePage = observer(function HomePage() {
	const [searchTerm, setSearchTerm] = useQueryState('q')

	const filteredTracks = useMemo(() => {
		if (!searchTerm) return TRACKS

		return TRACKS.filter(track =>
			track.name.toLowerCase().includes(searchTerm.toLowerCase())
		)
	}, [searchTerm])

	const popularTracks = TRACKS.slice(0, POPULAR_LIMIT)
	const featuredArtists = ARTISTS.slice(0, ARTISTS_LIMIT)

	return (
		<PageContainer>
			<SearchField
				value={searchTerm || ''}
				onChange={e => setSearchTerm(e.target.value)}
			/>

			<div className="relative">
				<img
					src="/banner.jpg"
					alt=""
					className="rounded-xl"
				/>
				<div className="flex items-center justify-between absolute bottom-layout left-0 w-full px-layout">
					<div>
						<h1 className="text-2xl font-semibold mb-0.5 text-white">
							Daft Punk
						</h1>
						<h2 className="text-primary font-medium">6.8m listeners</h2>
					</div>
					<button className="rounded-full bg-gradient-to-r from-[#2F3034] to-[#1F2026] p-5 border border-player-bg border-solid duration-300 hover:translate-y-[-2px] hover:shadow">
						<Play
							className="text-primary"
							fill="var(--color-primary)"
						/>
					</button>
				</div>
			</div>

			<section className="mt-8">
				<h2 className="text-xl font-bold mb-4">Popular Tracks</h2>
				<div className="flex flex-col gap-0">
					{popularTracks.map(track => (
						<Track
							key={track.name}
							track={track}
							trackList={popularTracks}
						/>
					))}
				</div>
			</section>

			<section className="mt-10">
				<h2 className="text-xl font-bold mb-4">Artists</h2>
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
				<h2 className="text-xl font-bold mb-4">All Tracks</h2>
				<div className="mt-5 flex flex-col gap-0">
					{filteredTracks.map(track => (
						<Track
							key={track.name}
							track={track}
							trackList={filteredTracks}
						/>
					))}
				</div>
			</section>
		</PageContainer>
	)
})
