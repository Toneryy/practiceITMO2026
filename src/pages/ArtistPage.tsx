import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { ARTISTS } from '@/data/artist.data'
import { TRACKS } from '@/data/tracks.data'
import { useDecodedParam } from '@/hooks/useDecodedParam'
import { playerStore } from '@/store/player.store'
import { Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export const ArtistPage = observer(function ArtistPage() {
	const decodedName = useDecodedParam('name')
	const [imageError, setImageError] = useState(false)

	const artist = ARTISTS.find(
		a => a.name.toLowerCase() === decodedName.toLowerCase()
	)

	if (!artist) {
		return (
			<PageContainer
				title="Artist not found"
				breadcrumbs={[
					{ label: 'Home', link: '/' },
					{ label: 'Artists', link: '/artists' }
				]}
			>
				<Link
					to="/artists"
					className="text-primary hover:underline"
				>
					Back to Artists
				</Link>
			</PageContainer>
		)
	}

	const topTracks = TRACKS.filter(
		track => track.artist.name.toLowerCase() === artist.name.toLowerCase()
	)

	const handlePlay = () => {
		if (topTracks.length === 0) return
		playerStore.setTrack(topTracks[0], topTracks)
		playerStore.play()
	}

	return (
		<PageContainer
			breadcrumbs={[
				{ label: 'Home', link: '/' },
				{ label: 'Artists', link: '/artists' },
				{ label: artist.name }
			]}
		>
			{/* Artist Header */}
			<div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end">
				{!artist.image || imageError ? (
					<div
						className="flex h-48 w-48 shrink-0 items-center justify-center rounded-full bg-primary/20 text-7xl font-bold text-primary shadow-xl sm:h-56 sm:w-56"
						aria-hidden
					>
						{artist.name.charAt(0).toUpperCase()}
					</div>
				) : (
					<img
						src={artist.image}
						alt={artist.name}
						className="h-48 w-48 shrink-0 rounded-full object-cover shadow-xl sm:h-56 sm:w-56"
						onError={() => setImageError(true)}
					/>
				)}
				<div className="flex flex-1 flex-col justify-end gap-2">
					<p className="text-sm font-medium uppercase tracking-wide text-neutral-400">
						Artist
					</p>
					<h1 className="text-4xl font-bold sm:text-5xl">{artist.name}</h1>
					<p className="text-neutral-400">
						{artist.listenersCount.toLocaleString()} listeners
					</p>
					<button
						type="button"
						onClick={handlePlay}
						disabled={topTracks.length === 0}
						className="mt-4 flex w-fit items-center gap-2 rounded-full bg-primary px-8 py-3 text-lg font-semibold text-black transition-transform hover:scale-105 disabled:opacity-50"
					>
						<Play
							size={24}
							fill="currentColor"
						/>
						<span>Play</span>
					</button>
				</div>
			</div>

			{/* Top Tracks */}
			<section>
				<h2 className="mb-4 text-xl font-bold">Top Tracks</h2>
				{topTracks.length === 0 ? (
					<p className="text-neutral-400">No tracks yet.</p>
				) : (
					<TrackTable tracks={topTracks} />
				)}
			</section>
		</PageContainer>
	)
})
