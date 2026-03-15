import { LIBRARY_MENU_ITEMS, MENU_ITEMS } from '@/data/menu.data'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Menu } from './Menu'
import { SidebarPlaylists } from './SidebarPlaylists'

interface LeftSidebarProps {
	mobileOpen?: boolean
	onMobileClose?: () => void
}

export function LeftSidebar({ mobileOpen, onMobileClose }: LeftSidebarProps) {
	const { t } = useTranslation()

	const content = (
		<>
			<Menu items={MENU_ITEMS} />
			<hr className="my-8 border-player-bg" />
			<Menu
				items={LIBRARY_MENU_ITEMS}
				title={t('nav.yourLibrary')}
				activeHighlight
			/>
			<hr className="my-8 border-player-bg" />
			<SidebarPlaylists />
		</>
	)

	return (
		<>
			{/* Desktop: visible on md+ */}
			<aside className="scrollbar-custom hidden h-full overflow-y-auto border-r border-player-bg px-layout py-9 md:block">
				{content}
			</aside>

			{/* Mobile overlay */}
			{mobileOpen && onMobileClose && (
				<div className="fixed inset-0 z-50 md:hidden">
					<div
						className="absolute inset-0 bg-black/60"
						onClick={onMobileClose}
						aria-hidden
					/>
					<aside className="scrollbar-custom absolute left-0 top-0 bottom-0 z-10 w-72 max-w-[85vw] overflow-y-auto border-r border-player-bg bg-bg px-4 py-9">
						<button
							type="button"
							onClick={onMobileClose}
							className="mb-4 flex size-10 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
							aria-label="Close menu"
						>
							<X size={22} />
						</button>
						{content}
					</aside>
				</div>
			)}
		</>
	)
}
