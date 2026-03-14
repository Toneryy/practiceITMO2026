import { useLyrics } from '@/hooks/useLyrics'
import { playerStore } from '@/store/player.store'
import { Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Lyrics.module.scss'

export const Lyrics = observer(function Lyrics() {
	const { t } = useTranslation()
	const track = playerStore.currentTrack
	const { lines, loading } = useLyrics({
		trackId: track?.id,
		trackName: track?.name
	})

	if (!playerStore.lyricsOpen) return null

	if (loading) {
		return (
			<div className={`${styles.lyrics} flex h-full items-center justify-center`}>
				<p className="text-center text-sm italic opacity-40">
					{t('player.lyricsLoading', 'Loading...')}
				</p>
			</div>
		)
	}

	if (!lines) {
		return (
			<div className={`${styles.lyrics} flex h-full items-center justify-center`}>
				<p className="text-center text-sm italic opacity-40">
					{t('player.lyricsNotFound')}
				</p>
			</div>
		)
	}

	return (
		<div className={styles.lyrics}>
			{lines.map((line, index) => (
				<Fragment key={index}>
					{line.section && <br />}
					{line.section && <div>[ {line.section} ]</div>}
					<button
						className={
							playerStore.currentTime === line.time ? styles.active : undefined
						}
						onClick={() => playerStore.requestSeek(line.time)}
					>
						<p>
							{playerStore.currentTime === line.time && (
								<Play
									fill="var(--color-primary)"
									className={styles.icon}
									size={10}
								/>
							)}
							{line.text}
						</p>
					</button>
				</Fragment>
			))}
		</div>
	)
})
