import { ArtistCard } from '@/components/ui/artist-card/ArtistCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { catalogStore } from '@/store/catalog.store'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

export const ArtistsPage = observer(function ArtistsPage() {
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
				{catalogStore.artists.map(artist => (
					<ArtistCard
						key={artist.name}
						artist={artist}
					/>
				))}
			</div>
		</PageContainer>
	)
})
