import type { PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import { playerStore } from '@/store/player.store'
import { AudioPlayer } from '../elements/player/AudioPlayer'
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar'

const Layout = observer(function Layout({ children }: PropsWithChildren<unknown>) {
	return (
		<>
			<div
				className={`grid h-[calc(100vh-80px)] overflow-hidden ${
					playerStore.lyricsOpen
						? 'grid-cols-[1fr_3.5fr_1.1fr]'
						: 'grid-cols-[1fr_4.6fr]'
				}`}
			>
				<LeftSidebar />
				<main className="scrollbar-custom h-full overflow-y-auto pt-5">{children}</main>
				{playerStore.lyricsOpen && <RightSidebar />}
			</div>
			<AudioPlayer />
		</>
	)
})

export default Layout
