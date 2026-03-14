import { SearchField } from '@/components/elements/search-field/SearchField'
import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { ARTISTS } from '@/data/artist.data'
import { TRACKS } from '@/data/tracks.data'
import { Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useQueryState } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const POPULAR_LIMIT = 6
const ARTISTS_LIMIT = 6

export const HomePage = observer(function HomePage() {
	const { t } = useTranslation()
	const [searchTerm, setSearchTerm] = useQueryState('q')
	const [inputValue, setInputValue] = useState(searchTerm ?? '')

	useEffect(() => {
		setInputValue(searchTerm ?? '')
	}, [searchTerm])

	const filteredTracks = useMemo(() => {
		const term = inputValue.trim().toLowerCase()
		if (!term) return TRACKS

		return TRACKS.filter(
			track =>
				track.name.toLowerCase().includes(term) ||
				track.artist.name.toLowerCase().includes(term)
		)
	}, [inputValue])

	const popularTracks = TRACKS.slice(0, POPULAR_LIMIT)
	const featuredArtists = ARTISTS.slice(0, ARTISTS_LIMIT)

	return (
		<PageContainer>
			<div className="mb-5">
				<SearchField
					value={inputValue}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const v = e.target.value
						setInputValue(v)
						setSearchTerm(v.trim() || null)
					}}
				/>
			</div>

			<div className="flex w-full items-end gap-6 rounded-xl bg-gradient-to-br from-[#3d2c5c] via-[#2d2d44] to-[#1a1a2e] p-6 pb-8">
				<img
					src="/banner.jpg"
					alt="Daft Punk"
					className="h-40 w-40 shrink-0 rounded-full object-cover shadow-2xl"
				/>
				<div className="min-w-0 flex-1">
					<h1 className="text-2xl font-semibold mb-0.5 text-white">
						Daft Punk
					</h1>
					<h2 className="text-primary font-medium">6.8m listeners</h2>
				</div>
				<button className="shrink-0 rounded-full bg-gradient-to-r from-[#2F3034] to-[#1F2026] p-5 border border-player-bg border-solid duration-300 hover:translate-y-[-2px] hover:shadow">
					<Play
						className="text-primary"
						fill="var(--color-primary)"
					/>
				</button>
			</div>

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
					<TrackTable tracks={filteredTracks} />
				</div>
			</section>
		</PageContainer>
	)
})
