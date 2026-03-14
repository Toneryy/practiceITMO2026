import { ProgressBar } from '@/components/ui/progress-bar/ProgressBar'
import { LYRICS } from '@/data/lyrics.data'
import { favoriteStore } from '@/store/favorite.store'
import { playerStore } from '@/store/player.store'
import { transformDuration } from '@/utils/transform-duration'
import cn from 'clsx'
import {
	ChevronDown,
	Clock,
	Disc3,
	Heart,
	ListMusic,
	Mic2,
	Pause,
	Play,
	Repeat,
	Repeat1,
	Shuffle,
	SkipBack,
	SkipForward,
	User,
	Volume,
	Volume1,
	Volume2
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const FullscreenPlayer = observer(function FullscreenPlayer() {
	const { t } = useTranslation()
	const track = playerStore.currentTrack
	const [queueOpen, setQueueOpen] = useState(false)

	useEffect(() => {
		if (!playerStore.fullscreenOpen) {
			setQueueOpen(false)
			return
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') playerStore.toggleFullscreen()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [playerStore.fullscreenOpen])

	if (!playerStore.fullscreenOpen || !track) return null

	const isFav = favoriteStore.favoritesName.includes(track.name)
	const VolumeIcon =
		playerStore.volume === 0
			? Volume
			: playerStore.volume < 50
				? Volume1
				: Volume2

	const lyric = LYRICS.find(l => l.trackName === track.name)
	const queue = playerStore.queueList
	const currentQueueIndex = queue.findIndex(t => t.name === track.name)

	const details = [
		{ icon: User, label: t('player.detailArtist'), value: track.artist.name },
		{ icon: Disc3, label: t('player.detailAlbum'), value: track.album },
		{ icon: Clock, label: t('player.detailDuration'), value: transformDuration(track.duration) },
		{ icon: Mic2, label: t('player.detailListeners'), value: track.artist.listenersCount?.toLocaleString() ?? '—' },
	]

	return (
		<div className="fixed inset-0 z-[200] overflow-y-auto text-white">
			{/* Sticky blurred background */}
			<div className="fixed inset-0 -z-10">
				<img
					src={track.cover}
					alt=""
					className="h-full w-full scale-110 object-cover blur-3xl"
				/>
				<div className="absolute inset-0 bg-black/65" />
			</div>

			{/* Top bar: close + queue toggle */}
			<div className="sticky top-0 z-20 flex items-center justify-between px-6 pt-5 pb-2">
				<div className="w-10" />
				<button
					type="button"
					onClick={() => playerStore.toggleFullscreen()}
					className="rounded-full p-2 text-white/50 transition hover:text-white"
					title="Close fullscreen (Esc)"
				>
					<ChevronDown size={30} />
				</button>
				<button
					type="button"
					onClick={() => setQueueOpen(v => !v)}
					className={cn(
						'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition',
						queueOpen
							? 'bg-white/20 text-white'
							: 'text-white/50 hover:text-white'
					)}
					title={queueOpen ? t('player.hideQueue') : t('player.showQueue')}
				>
					<ListMusic size={18} />
					{t('player.queue')}
				</button>
			</div>

			{/* ── Section 1: Player (+ sliding queue panel) ── */}
			<section className="flex min-h-[calc(100vh-64px)] items-center justify-center px-8 pb-16">
				<div
					className={cn(
						'flex w-full items-center gap-6 transition-all duration-500',
						queueOpen ? 'max-w-7xl' : 'max-w-5xl justify-center'
					)}
				>
					{/* Main player area */}
					<div
						className={cn(
							'grid items-center gap-16 transition-all duration-500',
							queueOpen
								? 'flex-1 grid-cols-2'
								: 'w-full max-w-5xl grid-cols-2 gap-20'
						)}
					>
						{/* Album art */}
						<div className="flex justify-center">
							<img
								src={track.cover}
								alt={track.name}
								className={cn(
									'aspect-square rounded-2xl object-cover shadow-2xl transition-all duration-500',
									queueOpen ? 'max-w-[300px]' : 'w-full max-w-[420px]'
								)}
							/>
						</div>

						{/* Controls */}
						<div className="flex flex-col gap-7">
							{/* Track info */}
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<h1
										className={cn(
											'truncate font-bold leading-tight transition-all duration-300',
											queueOpen ? 'text-2xl' : 'text-4xl'
										)}
									>
										{track.name}
									</h1>
									<p
										className={cn(
											'mt-1 truncate text-white/60 transition-all duration-300',
											queueOpen ? 'text-base' : 'text-xl'
										)}
									>
										{track.artist.name}
									</p>
								</div>
								<button
									type="button"
									onClick={() => favoriteStore.toggleFavorite(track.name)}
									className={cn(
										'mt-1 shrink-0 transition hover:scale-110',
										isFav ? 'text-primary' : 'text-white/60 hover:text-white'
									)}
								>
									<Heart
										size={queueOpen ? 24 : 32}
										className={cn(isFav && 'fill-primary')}
									/>
								</button>
							</div>

							{/* Progress */}
							<ProgressBar
								currentValue={playerStore.currentTime}
								value={track.duration}
								progress={playerStore.progress}
								onSeek={time => playerStore.requestSeek(time)}
								isTextDisplayed
							/>

							{/* Playback buttons */}
							<div className="flex items-center justify-center gap-6">
								<button
									type="button"
									onClick={() => playerStore.toggleShuffle()}
									className={cn(
										'opacity-60 transition hover:opacity-100',
										playerStore.isShuffle && 'text-primary opacity-100'
									)}
								>
									<Shuffle size={20} />
								</button>
								<button
									type="button"
									onClick={() => playerStore.changeTrack('prev')}
									className="opacity-60 transition hover:opacity-100"
								>
									<SkipBack size={26} fill="currentColor" />
								</button>
								<button
									type="button"
									onClick={() => playerStore.togglePlayPause()}
									className="rounded-full bg-white p-4 text-black shadow-xl transition hover:scale-105"
								>
									{playerStore.isPlaying ? (
										<Pause size={28} fill="currentColor" />
									) : (
										<Play size={28} fill="currentColor" />
									)}
								</button>
								<button
									type="button"
									onClick={() => playerStore.changeTrack('next')}
									className="opacity-60 transition hover:opacity-100"
								>
									<SkipForward size={26} fill="currentColor" />
								</button>
								<button
									type="button"
									onClick={() => playerStore.toggleRepeat()}
									className={cn(
										'opacity-60 transition hover:opacity-100',
										playerStore.repeatMode !== 'none' &&
											'text-primary opacity-100'
									)}
								>
									{playerStore.repeatMode === 'one' ? (
										<Repeat1 size={20} />
									) : (
										<Repeat size={20} />
									)}
								</button>
							</div>

							{/* Volume */}
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() =>
										playerStore.setVolume(playerStore.volume === 0 ? 85 : 0)
									}
									className="shrink-0 opacity-60 transition hover:opacity-100"
								>
									<VolumeIcon size={20} />
								</button>
								<ProgressBar
									currentValue={playerStore.volume}
									value={100}
									progress={playerStore.volume}
									onSeek={val => playerStore.setVolume(val)}
									isTextDisplayed={false}
									isThumbDisplayed
								/>
							</div>
						</div>
					</div>

					{/* Queue panel (slides in from right) */}
					<div
						className={cn(
							'overflow-hidden transition-all duration-500',
							queueOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'
						)}
					>
						<div className="flex h-[70vh] w-80 flex-col rounded-2xl bg-white/10 backdrop-blur-sm">
						<div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
							<h2 className="font-semibold">{t('player.queue')}</h2>
							<span className="text-sm text-white/40">{t('player.tracksCount', { count: queue.length })}</span>
						</div>
						<div className="scrollbar-custom flex-1 overflow-y-auto py-2">
							{queue.length === 0 ? (
								<p className="px-5 py-4 text-sm text-white/40">
									{t('player.noTracksInQueue')}
								</p>
								) : (
									queue.map((t, index) => {
										const isCurrent = t.name === track.name
										const isPast =
											currentQueueIndex !== -1 &&
											index < currentQueueIndex
										return (
											<button
												key={`${t.name}-${index}`}
												type="button"
												onClick={() => playerStore.playFromQueue(index)}
												className={cn(
													'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/10',
													isCurrent && 'bg-white/10',
													isPast && 'opacity-40'
												)}
											>
												<img
													src={t.cover}
													alt=""
													className="h-10 w-10 shrink-0 rounded-lg object-cover"
												/>
												<div className="min-w-0 flex-1">
													<p
														className={cn(
															'truncate text-sm font-medium',
															isCurrent ? 'text-primary' : 'text-white'
														)}
													>
														{t.name}
													</p>
													<p className="truncate text-xs text-white/50">
														{t.artist.name}
													</p>
												</div>
												<span className="shrink-0 text-xs text-white/40 tabular-nums">
													{transformDuration(t.duration)}
												</span>
											</button>
										)
									})
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Section 2: Lyrics + Details ── */}
			<section className="mx-auto w-full max-w-5xl px-4 pb-16">
				<div className={cn('grid gap-8', lyric ? 'grid-cols-2' : 'grid-cols-1')}>
					{/* Lyrics */}
					{lyric && (
						<div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm">
							<h2 className="mb-6 text-xl font-semibold">{t('player.lyrics')}</h2>
							<div className="flex flex-col gap-1 text-base leading-relaxed">
								{lyric.lines.map((line, i) => (
									<Fragment key={i}>
										{line.section && (
											<p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-widest text-white/40">
												{line.section}
											</p>
										)}
										<button
											type="button"
											onClick={() => playerStore.requestSeek(line.time)}
											className={cn(
												'text-left transition-colors hover:text-white',
												playerStore.currentTime === line.time
													? 'font-semibold text-primary'
													: 'text-white/60'
											)}
										>
											{line.text}
										</button>
									</Fragment>
								))}
							</div>
						</div>
					)}

					{/* Details */}
					<div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm">
						<h2 className="mb-6 text-xl font-semibold">{t('player.details')}</h2>
						<div className="grid grid-cols-1 gap-4">
							{details.map(({ icon: Icon, label, value }) => (
								<div
									key={label}
									className="flex items-center gap-4 rounded-xl bg-white/5 px-5 py-4"
								>
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
										<Icon size={18} className="text-white/70" />
									</div>
									<div className="min-w-0">
										<p className="text-xs text-white/40">{label}</p>
										<p className="truncate font-medium">{value}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── Section 3: Queue grid ── */}
			{queue.length > 0 && (
				<section className="mx-auto w-full max-w-5xl px-4 pb-20">
					<div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm">
						<div className="mb-6 flex items-center gap-2">
							<ListMusic size={20} className="text-white/60" />
							<h2 className="text-xl font-semibold">{t('player.queue')}</h2>
							<span className="ml-auto text-sm text-white/40">
								{t('player.tracksCount', { count: queue.length })}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{queue.map((t, index) => {
								const isCurrent = t.name === track.name
								const isPast =
									currentQueueIndex !== -1 && index < currentQueueIndex
								return (
									<button
										key={`${t.name}-${index}`}
										type="button"
										onClick={() => playerStore.playFromQueue(index)}
										className={cn(
											'flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/10',
											isCurrent
												? 'bg-primary/20 ring-1 ring-primary/40'
												: 'bg-white/5',
											isPast && 'opacity-40'
										)}
									>
										<img
											src={t.cover}
											alt=""
											className="h-12 w-12 shrink-0 rounded-lg object-cover"
										/>
										<div className="min-w-0 flex-1">
											<p
												className={cn(
													'truncate text-sm font-medium',
													isCurrent ? 'text-primary' : 'text-white'
												)}
											>
												{t.name}
											</p>
											<p className="truncate text-xs text-white/50">
												{t.artist.name}
											</p>
											<p className="text-xs text-white/30 tabular-nums">
												{transformDuration(t.duration)}
											</p>
										</div>
									</button>
								)
							})}
						</div>
					</div>
				</section>
			)}
		</div>
	)
})
