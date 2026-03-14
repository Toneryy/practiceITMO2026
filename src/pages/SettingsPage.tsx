import { PageContainer } from '@/components/ui/page-container/PageContainer'
import { authStore } from '@/store/auth.store'
import { languageStore } from '@/store/language.store'
import { playerStore } from '@/store/player.store'
import {
	Bell,
	Download,
	Globe,
	HardDrive,
	Headphones,
	Lock,
	Monitor,
	Music2,
	Shield,
	User,
	Wifi
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
	return (
		<button
			type="button"
			onClick={() => onChange(!checked)}
			className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
				checked ? 'bg-primary' : 'bg-white/10'
			}`}
		>
			<span
				className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
					checked ? 'translate-x-5' : ''
				}`}
			/>
		</button>
	)
}

function SettingRow({
	icon: Icon,
	label,
	description,
	children
}: {
	icon: React.ElementType
	label: string
	description?: string
	children: React.ReactNode
}) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-4 py-3.5">
			<div className="flex items-center gap-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
					<Icon size={18} className="text-primary" />
				</div>
				<div>
					<p className="text-sm font-medium text-white">{label}</p>
					{description && (
						<p className="mt-0.5 text-xs text-neutral-500">{description}</p>
					)}
				</div>
			</div>
			<div className="shrink-0">{children}</div>
		</div>
	)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="mt-8 first:mt-0">
			<h2 className="mb-3 text-base font-bold text-white">{title}</h2>
			<div className="flex flex-col gap-2">{children}</div>
		</section>
	)
}

export const SettingsPage = observer(function SettingsPage() {
	const { t } = useTranslation()

	if (!authStore.isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	const [notifications, setNotifications] = useState(true)
	const [newReleases, setNewReleases] = useState(true)
	const [playlistUpdates, setPlaylistUpdates] = useState(false)
	const [autoplay, setAutoplay] = useState(true)
	const [crossfade, setCrossfade] = useState(false)
	const [normalize, setNormalize] = useState(true)
	const [privateSession, setPrivateSession] = useState(false)
	const [showListening, setShowListening] = useState(true)
	const [offlineMode, setOfflineMode] = useState(false)
	const [highQuality, setHighQuality] = useState(false)
	const [hardwareAccel, setHardwareAccel] = useState(true)

	const currentLang = languageStore.language === 'en' ? 'English' : 'Русский'

	return (
		<PageContainer
			title={t('settings.title')}
			breadcrumbs={[
				{ label: t('nav.home'), link: '/' },
				{ label: t('settings.title') }
			]}
		>
			{/* Account */}
			<Section title={t('settings.account')}>
				<SettingRow
					icon={User}
					label={t('settings.username')}
					description={authStore.user?.email}
				>
					<span className="text-sm text-neutral-400">{authStore.user?.username}</span>
				</SettingRow>
				<SettingRow
					icon={Globe}
					label={t('settings.language')}
					description={t('settings.languageDesc')}
				>
					<select
						value={languageStore.language}
						onChange={e => languageStore.setLanguage(e.target.value as 'en' | 'ru')}
						className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
					>
						<option value="en">English</option>
						<option value="ru">Русский</option>
					</select>
				</SettingRow>
				<SettingRow
					icon={Shield}
					label={t('settings.changePassword')}
					description={t('settings.changePasswordDesc')}
				>
					<button className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-primary hover:text-white">
						{t('settings.change')}
					</button>
				</SettingRow>
			</Section>

			{/* Playback */}
			<Section title={t('settings.playback')}>
				<SettingRow
					icon={Headphones}
					label={t('settings.audioQuality')}
					description={t('settings.audioQualityDesc')}
				>
					<select
						value={highQuality ? 'high' : 'normal'}
						onChange={e => setHighQuality(e.target.value === 'high')}
						className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
					>
						<option value="normal">{t('settings.qualityNormal')}</option>
						<option value="high">{t('settings.qualityHigh')}</option>
					</select>
				</SettingRow>
				<SettingRow
					icon={Music2}
					label={t('settings.crossfade')}
					description={t('settings.crossfadeDesc')}
				>
					<Toggle checked={crossfade} onChange={setCrossfade} />
				</SettingRow>
				<SettingRow
					icon={Music2}
					label={t('settings.normalize')}
					description={t('settings.normalizeDesc')}
				>
					<Toggle checked={normalize} onChange={setNormalize} />
				</SettingRow>
				<SettingRow
					icon={Music2}
					label={t('settings.autoplay')}
					description={t('settings.autoplayDesc')}
				>
					<Toggle checked={autoplay} onChange={setAutoplay} />
				</SettingRow>
			</Section>

			{/* Notifications */}
			<Section title={t('settings.notifications')}>
				<SettingRow
					icon={Bell}
					label={t('settings.pushNotifications')}
					description={t('settings.pushDesc')}
				>
					<Toggle checked={notifications} onChange={setNotifications} />
				</SettingRow>
				<SettingRow
					icon={Bell}
					label={t('settings.newReleases')}
					description={t('settings.newReleasesDesc')}
				>
					<Toggle checked={newReleases} onChange={setNewReleases} />
				</SettingRow>
				<SettingRow
					icon={Bell}
					label={t('settings.playlistUpdates')}
					description={t('settings.playlistUpdatesDesc')}
				>
					<Toggle checked={playlistUpdates} onChange={setPlaylistUpdates} />
				</SettingRow>
			</Section>

			{/* Privacy */}
			<Section title={t('settings.privacy')}>
				<SettingRow
					icon={Lock}
					label={t('settings.privateSession')}
					description={t('settings.privateSessionDesc')}
				>
					<Toggle checked={privateSession} onChange={setPrivateSession} />
				</SettingRow>
				<SettingRow
					icon={Monitor}
					label={t('settings.showListening')}
					description={t('settings.showListeningDesc')}
				>
					<Toggle checked={showListening} onChange={setShowListening} />
				</SettingRow>
			</Section>

			{/* Storage & Data */}
			<Section title={t('settings.storageAndData')}>
				<SettingRow
					icon={Wifi}
					label={t('settings.offlineMode')}
					description={t('settings.offlineModeDesc')}
				>
					<Toggle checked={offlineMode} onChange={setOfflineMode} />
				</SettingRow>
				<SettingRow
					icon={Monitor}
					label={t('settings.hardwareAcceleration')}
					description={t('settings.hardwareAccelerationDesc')}
				>
					<Toggle checked={hardwareAccel} onChange={setHardwareAccel} />
				</SettingRow>
				<SettingRow
					icon={HardDrive}
					label={t('settings.clearCache')}
					description={t('settings.clearCacheDesc')}
				>
					<button className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-red-500/50 hover:text-red-400">
						{t('settings.clear')}
					</button>
				</SettingRow>
				<SettingRow
					icon={Download}
					label={t('settings.downloadQuality')}
					description={t('settings.downloadQualityDesc')}
				>
					<select
						defaultValue="normal"
						className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-primary"
					>
						<option value="low">{t('settings.qualityLow')}</option>
						<option value="normal">{t('settings.qualityNormal')}</option>
						<option value="high">{t('settings.qualityHigh')}</option>
					</select>
				</SettingRow>
			</Section>
		</PageContainer>
	)
})
