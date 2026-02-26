import { TrackInfo } from '@/components/ui/track-info/TrackInfo'
import { favoriteStore } from '@/store/favorite.store'
import type { ITrack } from '@/types/track.types'
import { transformDuration } from '@/utils/transform-duration'
import { Heart } from 'lucide-react'
import { AddToPlaylist } from './AddToPlaylist'

interface Props {
	track: ITrack
}

export function Track({ track }: Props) {
	return (
		<div className="border-b border-player-bg/50 py-7 flex justify-between items-center last:border-0">
			<TrackInfo
				title={track.name}
				subTitle={transformDuration(track.duration)}
				image={track.cover}
				track={track}
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
				<AddToPlaylist track={track} />
			</div>
		</div>
	)
}
