import type { PropsWithChildren } from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { playerStore } from '@/store/player.store'
import { AudioPlayer } from '../elements/player/AudioPlayer'
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar'
import { Header } from './Header'

const Layout = observer(function Layout({ children }: PropsWithChildren<unknown>) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const gridCols =
		playerStore.lyricsOpen || playerStore.queueOpen
			? 'grid-cols-1 md:grid-cols-[1fr_3.5fr_1.1fr]'
			: 'grid-cols-1 md:grid-cols-[1fr_4.6fr]'

	return (
		<>
			<div className={`grid h-[calc(100vh-80px)] overflow-hidden ${gridCols}`}>
				<LeftSidebar
					mobileOpen={mobileMenuOpen}
					onMobileClose={() => setMobileMenuOpen(false)}
				/>
				<main className="scrollbar-custom relative flex min-w-0 flex-1 flex-col overflow-y-auto">
					<Header onMenuClick={() => setMobileMenuOpen(true)} />
					<div className="flex-1 pt-1">{children}</div>
				</main>
				{(playerStore.lyricsOpen || playerStore.queueOpen) && (
					<div className="hidden md:block">
						<RightSidebar />
					</div>
				)}
			</div>
			<AudioPlayer />
		</>
	)
})

export default Layout
