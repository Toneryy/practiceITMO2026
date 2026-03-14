import { LYRICS } from '@/data/lyrics.data'
import { playerStore } from '@/store/player.store'
import { Play } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Fragment } from 'react'
import styles from './Lyrics.module.scss'

export const Lyrics = observer(function Lyrics() {
	if (!playerStore.lyricsOpen) return null

	const lyric = LYRICS.find(
		l => l.trackName === playerStore.currentTrack?.name
	)
	if (!lyric) return null

	return (
		<div className={styles.lyrics}>
			{lyric.lines.map((line, index) => (
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
