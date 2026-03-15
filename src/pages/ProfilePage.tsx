import { TrackTable } from '@/components/elements/track-table/TrackTable'
import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { authStore, authFetch } from '@/store/auth.store'
import { catalogStore } from '@/store/catalog.store'
import type { ITrack } from '@/types/track.types'
import { Heart, ListMusic, LogOut, Music2, User, Users } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

interface HistoryTrack {
	name: string
	file: string
	cover: string
	duration: number
	explicit: boolean
	artistName: string
	albumName: string | null
	playedAt: string
}

export const ProfilePage = observer(function ProfilePage() {
	const { t } = useTranslation()
	const [recentTracks, setRecentTracks] = useState<ITrack[]>([])
	const [isLoadingHistory, setIsLoadingHistory] = useState(false)

	useEffect(() => {
		if (!authStore.isAuthenticated) return

		authStore.fetchMe()

		setIsLoadingHistory(true)
		authFetch('/api/listen-history?limit=20')
			.then(res => (res.ok ? res.json() : []))
			.then((data: HistoryTrack[]) => {
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
				setRecentTracks(tracks)
			})
			.catch(() => {})
			.finally(() => setIsLoadingHistory(false))
	}, [])

	if (!authStore.isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	const user = authStore.user!
	const counts = user._count

	const stats = [
		{ icon: Heart, label: t('profile.likedSongs'), value: counts?.favorites ?? 0 },
		{ icon: ListMusic, label: t('profile.playlists'), value: counts?.playlists ?? 0 },
		{ icon: Users, label: t('profile.subscriptions'), value: counts?.subscriptions ?? 0 },
		{ icon: Music2, label: t('profile.listenHistory'), value: counts?.listenHistory ?? 0 }
	]

	return (
		<PageContainer
			title={t('profile.title')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('profile.title') }
			]}
		>
			{/* Profile header */}
			<div className="flex items-center gap-6">
				{user.avatar ? (
					<img
						src={user.avatar}
						alt={user.username}
						className="h-28 w-28 rounded-full object-cover shadow-2xl"
					/>
				) : (
					<div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 shadow-2xl">
						<User size={48} className="text-primary" />
					</div>
				)}
				<div>
					<h1 className="text-2xl font-bold text-white sm:text-3xl">{user.username}</h1>
					<p className="mt-1 text-sm text-neutral-400">{user.email}</p>
					{user.createdAt && (
						<p className="mt-1 text-xs text-neutral-500">
							{t('profile.memberSince')}{' '}
							{new Date(user.createdAt).toLocaleDateString()}
						</p>
					)}
				</div>
			</div>

			{/* Stats */}
			<section className="mt-8">
				<h2 className="mb-4 text-lg font-bold text-white">{t('profile.stats')}</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{stats.map(s => (
						<div
							key={s.label}
							className="flex flex-col items-center gap-1 rounded-xl bg-white/5 px-4 py-4"
						>
							<s.icon size={20} className="text-primary" />
							<span className="text-2xl font-bold text-white">{s.value}</span>
							<span className="text-xs text-neutral-400">{s.label}</span>
						</div>
					))}
				</div>
			</section>

			{/* Recently played from server */}
			<section className="mt-10">
				<h2 className="mb-4 text-lg font-bold text-white">
					{t('profile.recentlyPlayed')}
				</h2>
				{isLoadingHistory ? (
					<div className="flex justify-center py-8">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					</div>
				) : recentTracks.length === 0 ? (
					<p className="text-neutral-400">{t('profile.noRecentTracks')}</p>
				) : (
					<TrackTable tracks={recentTracks} />
				)}
			</section>

			{/* Logout */}
			<div className="mt-10">
				<button
					onClick={() => authStore.logout()}
					className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-neutral-300 transition hover:border-red-500/50 hover:text-red-400"
				>
					<LogOut size={16} />
					{t('auth.logout')}
				</button>
			</div>
		</PageContainer>
	)
})
