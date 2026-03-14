import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { TRACKS } from '@/data/tracks.data'
import { favoriteStore } from '@/store/favorite.store'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

export const LikedSongsPage = observer(() => {
	const { t } = useTranslation()
	const likedTracks = TRACKS.filter(track =>
		favoriteStore.favoritesName.includes(track.name)
	)

	return (
		<PageContainer
			title={t('likedSongs.title')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('likedSongs.title') }
			]}
		>
			{likedTracks.length === 0 ? (
				<p className="text-neutral-400">{t('likedSongs.empty')}</p>
			) : (
				<TrackTable tracks={likedTracks} />
			)}
		</PageContainer>
	)
})
