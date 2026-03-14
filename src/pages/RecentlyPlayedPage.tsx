import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { authStore, authFetch } from '@/store/auth.store'
import { catalogStore } from '@/store/catalog.store'
import { playerStore } from '@/store/player.store'
import type { ITrack } from '@/types/track.types'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const RecentlyPlayedPage = observer(() => {
	const { t } = useTranslation()
	const [serverTracks, setServerTracks] = useState<ITrack[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!authStore.isAuthenticated) return
		setLoading(true)
		authFetch('/api/listen-history?limit=50')
			.then(res => (res.ok ? res.json() : []))
			.then((data: { name: string; file: string; cover: string; duration: number; explicit: boolean; artistName: string }[]) => {
				const tracks: ITrack[] = data.map(h => {
					const catalogTrack = catalogStore.tracks.find(ct => ct.name === h.name)
					if (catalogTrack) return catalogTrack
					return {
						name: h.name,
						file: h.file,
						cover: h.cover,
						duration: h.duration,
						explicit: h.explicit,
						artist: { name: h.artistName, image: '', listenersCount: 0 }
					} as ITrack
				})
				setServerTracks(tracks)
			})
			.catch(() => {})
			.finally(() => setLoading(false))
	}, [])

	const tracks = authStore.isAuthenticated ? serverTracks : playerStore.recentTracks

	return (
		<PageContainer
			title={t('recentlyPlayed.title')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('recentlyPlayed.title') }
			]}
		>
			{loading ? (
				<div className="flex justify-center py-16">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : tracks.length === 0 ? (
				<p className="text-neutral-400">{t('recentlyPlayed.empty')}</p>
			) : (
				<TrackTable tracks={tracks} />
			)}
		</PageContainer>
	)
})
