import type { PropsWithChildren } from 'react'
import { AudioPlayer } from '../elements/player/AudioPlayer'
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar'

export default function Layout({ children }: PropsWithChildren<unknown>) {
	return (
		<>
			<div className="min-h-screen h-full grid grid-cols-[1fr_3.5fr_1.1fr] pb-20">
				<LeftSidebar />
				<main className="px-8 py-layout">{children}</main>
				<RightSidebar />
			</div>
			<AudioPlayer />
		</>
	)
}
