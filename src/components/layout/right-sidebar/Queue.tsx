import { TrackOptionsMenu } from '@/components/elements/track-item/TrackOptionsMenu'
import { playerStore } from '@/store/player.store'
import { transformDuration } from '@/utils/transform-duration'
import cn from 'clsx'
import { observer } from 'mobx-react-lite'

export const Queue = observer(function Queue() {
	if (!playerStore.queueOpen) return null

	const queueList = playerStore.queueList

	return (
		<div className="flex flex-col py-4">
			<h2 className="mb-4 px-4 text-base font-semibold text-white">Queue</h2>
			{queueList.length === 0 ? (
				<p className="px-4 text-sm text-white/50">
					No tracks in queue. Play something from Home or a playlist.
				</p>
			) : (
				<ul className="flex flex-col">
					{queueList.map((track, index) => {
						const isCurrent =
							playerStore.currentTrack?.name === track.name
						return (
							<li
								key={`${track.name}-${index}`}
								className={cn(
									'group flex items-center gap-3 px-4 py-2 transition-colors hover:bg-white/10',
									isCurrent && 'bg-white/10'
								)}
							>
								<button
									type="button"
									onClick={() => playerStore.playFromQueue(index)}
									className="flex min-w-0 flex-1 items-center gap-3 text-left"
								>
									<span className="w-5 shrink-0 text-center text-sm text-white/50 tabular-nums">
										{index + 1}
									</span>
									<img
										src={track.cover}
										alt=""
										className="h-9 w-9 shrink-0 rounded object-cover"
									/>
									<div className="min-w-0 flex-1">
										<p
											className={cn(
												'truncate text-sm font-medium',
												isCurrent ? 'text-primary' : 'text-white'
											)}
										>
											{track.name}
										</p>
										<p className="truncate text-xs text-white/50">
											{track.artist.name}
										</p>
									</div>
									<span className="shrink-0 text-xs text-white/50 tabular-nums">
										{transformDuration(track.duration)}
									</span>
								</button>
								<div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
									<TrackOptionsMenu track={track} inQueue />
								</div>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
})
