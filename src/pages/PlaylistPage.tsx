import { Track } from '@/components/elements/track-item/Track'
import { ConfirmModal } from '@/components/ui/confirm-modal/ConfirmModal'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { TRACKS } from '@/data/tracks.data'
import { playlistStore } from '@/store/playlist.store'
import { playerStore } from '@/store/player.store'
import { Home, Play, Shuffle, Trash2 } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function formatTotalDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	if (h > 0) return `${h} hr ${m} min`
	return `${m} min`
}

export const PlaylistPage = observer(() => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)

	const playlist = playlistStore.playlists.find(p => p.name === id)

	if (!playlist) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-4">Playlist not found</h1>
				<Link
					to="/"
					className="text-primary hover:underline"
				>
					Back to Home
				</Link>
			</div>
		)
	}

	const tracks = TRACKS.filter(track => playlist.tracks.includes(track.name))
	const totalDurationSec = tracks.reduce((sum, t) => sum + t.duration, 0)

	const handlePlay = () => {
		if (tracks.length === 0) return
		playerStore.setTrack(tracks[0], tracks)
		playerStore.play()
	}

	const handleShuffle = () => {
		if (tracks.length === 0) return
		const shuffled = [...tracks].sort(() => Math.random() - 0.5)
		playerStore.setTrack(shuffled[0], shuffled)
		playerStore.play()
	}

	const handleDeletePlaylist = () => {
		if (!playlist) return
		playlistStore.deletePlaylist(playlist.name)
		setDeleteModalOpen(false)
		navigate('/')
	}

	return (
		<PageContainer
			breadcrumbs={[
				{ label: 'Home', link: '/' },
				{ label: 'Playlist', link: '/' },
				{ label: playlist.name }
			]}
		>
			<div className="mb-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
						<div className="text-neutral-400 text-sm mt-1 mb-6">
							{tracks.length} tracks • {formatTotalDuration(totalDurationSec)}
						</div>
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={handlePlay}
								disabled={tracks.length === 0}
								className="rounded-full bg-primary text-black p-3.5 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
							>
								<Play
									size={24}
									fill="currentColor"
								/>
							</button>
							<button
								type="button"
								onClick={handleShuffle}
								disabled={tracks.length === 0}
								className="rounded-full bg-white/10 p-3.5 hover:bg-white/20 transition-colors disabled:opacity-50"
							>
								<Shuffle size={24} />
							</button>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setDeleteModalOpen(true)}
						className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-colors"
						title="Delete playlist"
					>
						<Trash2 size={18} />
						<span>Delete playlist</span>
					</button>
				</div>
			</div>

			<ConfirmModal
				open={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDeletePlaylist}
				title="Delete playlist?"
				confirmLabel="Delete"
				cancelLabel="Cancel"
				variant="danger"
			>
				Are you sure you want to delete &quot;{playlist.name}&quot;? This cannot be
				undone.
			</ConfirmModal>

			{/* Empty state */}
			{tracks.length === 0 ? (
				<div className="rounded-xl bg-white/5 border border-white/10 border-dashed py-16 px-6 text-center">
					<p className="text-white/60 mb-2">No tracks in this playlist yet.</p>
					<p className="text-sm text-white/40 mb-6">
						Add tracks from Home or search — use the menu on a track to add it
						here.
					</p>
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 hover:bg-white/20 transition-colors"
					>
						<Home size={16} />
						Find tracks
					</Link>
				</div>
			) : (
				<div className="flex flex-col">
					{tracks.map((track, index) => (
						<div
							key={track.name}
							className="flex items-center gap-3 group"
						>
							<span className="w-8 shrink-0 text-center text-white/50 text-sm tabular-nums">
								{index + 1}
							</span>
							<div className="flex-1 min-w-0">
								<Track
									track={track}
									trackList={tracks}
									playlistName={playlist.name}
								/>
							</div>
							<button
								type="button"
								onClick={() =>
									playlistStore.toggleTrackInPlaylist(playlist.name, track.name)
								}
								className="shrink-0 p-2 text-white/40 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
								title="Remove from playlist"
							>
								<Trash2 size={18} />
							</button>
						</div>
					))}
				</div>
			)}
		</PageContainer>
	)
})
