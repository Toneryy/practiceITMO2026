import { Track } from '@/components/elements/track-item/Track'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { TRACKS } from '@/data/tracks.data'
import { favoriteStore } from '@/store/favorite.store'
import { observer } from 'mobx-react-lite'

export const LikedSongsPage = observer(() => {
	const likedTracks = TRACKS.filter(track =>
		favoriteStore.favoritesName.includes(track.name)
	)

	return (
		<PageContainer
			title="Liked Songs"
			breadcrumbs={[
				{ label: 'Home', link: '/' },
				{ label: 'Liked Songs' }
			]}
		>
			{likedTracks.length === 0 ? (
				<p className="text-neutral-400">You haven&apos;t liked any songs yet.</p>
			) : (
				<div className="flex flex-col gap-2">
					{likedTracks.map(track => (
						<Track
							key={track.name}
							track={track}
						/>
					))}
				</div>
			)}
		</PageContainer>
	)
})
