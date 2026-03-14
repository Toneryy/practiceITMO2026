import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { ARTISTS } from '@/data/artist.data'
import { useTranslation } from 'react-i18next'

export function ArtistsPage() {
	const { t } = useTranslation()

	return (
		<PageContainer
			title={t('nav.artists')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('nav.artists') }
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
