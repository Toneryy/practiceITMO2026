import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { TRACKS } from '@/data/tracks.data'
import { useDecodedParam } from '@/hooks/useDecodedParam'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const AlbumPage = observer(function AlbumPage() {
	const { t } = useTranslation()
	const albumName = useDecodedParam('name')

	const albumTracks = TRACKS.filter(track => track.album === albumName)

	if (albumTracks.length === 0) {
		return (
			<PageContainer
				title={t('album.notFound')}
				breadcrumbs={[
					{ label: t('nav.home'), link: '/' },
					{ label: t('nav.albums'), link: '/albums' }
				]}
			>
				<Link
					to="/albums"
					className="text-primary hover:underline"
				>
					{t('album.backToAlbums')}
				</Link>
			</PageContainer>
		)
	}

	const album = albumTracks[0]

	return (
		<PageContainer
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('nav.albums'), link: '/albums' },
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
					<p className="text-sm uppercase text-neutral-400">{t('album.type')}</p>
					<h1 className="text-4xl font-bold">{albumName}</h1>
					<p className="text-neutral-400">{album.artist.name}</p>
				</div>
			</div>

			<TrackTable tracks={albumTracks} />
		</PageContainer>
	)
})
