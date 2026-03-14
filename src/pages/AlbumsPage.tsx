import { AlbumCard } from '@/components/ui/album-card/AlbumCard'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { TRACKS } from '@/data/tracks.data'
import { useTranslation } from 'react-i18next'

export function AlbumsPage() {
	const { t } = useTranslation()
	const albumsMap = new Map<string, (typeof TRACKS)[number]>()

	TRACKS.forEach(track => {
		if (!albumsMap.has(track.album)) {
			albumsMap.set(track.album, track)
		}
	})

	const albums = Array.from(albumsMap.entries())

	return (
		<PageContainer
			title={t('nav.albums')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('nav.albums') }
			]}
		>
			<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
				{albums.map(([album, track]) => (
					<AlbumCard
						key={album}
						album={album}
						cover={track.cover}
						artist={track.artist.name}
					/>
				))}
			</div>
		</PageContainer>
	)
}
