import { TrackInfo } from '@/components/ui/track-info/TrackInfo'
import { favoriteStore } from '@/store/favorite.store'
import type { ITrack } from '@/types/track.types'
import { transformDuration } from '@/utils/transform-duration'
import { Heart } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { TrackOptionsMenu } from './TrackOptionsMenu'

interface Props {
	track: ITrack
	trackList?: ITrack[]
	playlistName?: string | null
}

export const Track = observer(function Track({
	track,
	trackList,
	playlistName
}: Props) {
	return (
		<div className="border-b border-player-bg/50 py-7 flex justify-between items-center last:border-0">
			<TrackInfo
				title={track.name}
				subTitle={transformDuration(track.duration)}
				image={track.cover}
				track={track}
				trackList={trackList}
			/>

			<div className="flex items-center gap-4">
				<button
					onClick={() => {
						favoriteStore.toggleFavorite(track.name)
					}}
				>
					<Heart
						className="text-primary opacity-85 duration-300 hover:opacity-100"
						fill={
							favoriteStore.favoritesName.includes(track.name)
								? 'var(--color-primary)'
								: 'none'
						}
					/>
				</button>
				<TrackOptionsMenu track={track} playlistName={playlistName} />
			</div>
		</div>
	)
})
