import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { playerStore } from '@/store/player.store'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

export const RecentlyPlayedPage = observer(() => {
	const { t } = useTranslation()
	const tracks = playerStore.recentTracks

	return (
		<PageContainer
			title={t('recentlyPlayed.title')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('recentlyPlayed.title') }
			]}
		>
			{tracks.length === 0 ? (
				<p className="text-neutral-400">{t('recentlyPlayed.empty')}</p>
			) : (
				<TrackTable tracks={tracks} />
			)}
		</PageContainer>
	)
})
