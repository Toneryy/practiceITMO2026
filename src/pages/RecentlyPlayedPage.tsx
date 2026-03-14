import { Track } from '@/components/elements/track-item/Track'
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
				<div className="flex flex-col">
					{tracks.map(track => (
						<Track
							key={track.name}
							track={track}
							trackList={tracks}
						/>
					))}
				</div>
			)}
		</PageContainer>
	)
})
