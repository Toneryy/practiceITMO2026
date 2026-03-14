import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { ARTISTS } from '@/data/artist.data'

export function ArtistsPage() {
	return (
		<PageContainer
			title="Artists"
			breadcrumbs={[
				{ label: 'Home', link: '/' },
				{ label: 'Artists' }
			]}
		>
			<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
				{ARTISTS.map(artist => (
					<ArtistCard
						key={artist.name}
						artist={artist}
					/>
				))}
			</div>
		</PageContainer>
	)
}
