import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { playerStore } from '@/store/player.store'
import { observer } from 'mobx-react-lite'

export const RecentlyPlayedPage = observer(() => {
	const tracks = playerStore.recentTracks

	return (
		<PageContainer
			title="Recently Played"
			breadcrumbs={[
				{ label: 'Home', link: '/' },
				{ label: 'Recently Played' }
			]}
		>
			{tracks.length === 0 ? (
				<p className="text-neutral-400">No tracks played yet.</p>
			) : (
				<TrackTable tracks={tracks} />
			)}
		</PageContainer>
	)
})
