import { Track } from '@/components/elements/track-item/Track'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { TRACKS } from '@/data/tracks.data'
import { useDecodedParam } from '@/hooks/useDecodedParam'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

export const AlbumPage = observer(function AlbumPage() {
	const albumName = useDecodedParam('name')

	const albumTracks = TRACKS.filter(track => track.album === albumName)

	if (albumTracks.length === 0) {
		return (
			<PageContainer
				title="Album not found"
				breadcrumbs={[
					{ label: 'Home', link: '/' },
					{ label: 'Albums', link: '/albums' }
				]}
			>
				<Link
					to="/albums"
					className="text-primary hover:underline"
				>
					Back to Albums
				</Link>
			</PageContainer>
		)
	}

	const album = albumTracks[0]

	return (
		<PageContainer
			breadcrumbs={[
				{ label: 'Home', link: '/' },
				{ label: 'Albums', link: '/albums' },
				{ label: albumName }
			]}
		>
			<div className="mb-8 flex gap-6">
				<img
					src={album.cover}
					alt={albumName}
					className="h-48 w-48 shrink-0 rounded-lg object-cover"
				/>
				<div className="flex flex-col justify-end">
					<p className="text-sm uppercase text-neutral-400">Album</p>
					<h1 className="text-4xl font-bold">{albumName}</h1>
					<p className="text-neutral-400">{album.artist.name}</p>
				</div>
			</div>

			<div className="flex flex-col">
				{albumTracks.map(track => (
					<Track
						key={track.name}
						track={track}
						trackList={albumTracks}
					/>
				))}
			</div>
		</PageContainer>
	)
})
