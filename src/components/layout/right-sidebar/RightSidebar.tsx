import { playerStore } from '@/store/player.store'
import { observer } from 'mobx-react-lite'
import { Lyrics } from './Lyrics'
import { Queue } from './Queue'

export const RightSidebar = observer(function RightSidebar() {
	const showLyrics = playerStore.lyricsOpen && !playerStore.queueOpen
	const showQueue = playerStore.queueOpen

	return (
		<div
			id="right-sidebar"
			className="scrollbar-custom h-full overflow-y-auto bg-bg-secondary px-layout py-0"
		>
			{showQueue && <Queue />}
			{showLyrics && <Lyrics />}
		</div>
	)
})
