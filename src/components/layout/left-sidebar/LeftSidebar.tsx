import { LIBRARY_MENU_ITEMS, MENU_ITEMS } from '@/data/menu.data'
import { useTranslation } from 'react-i18next'
import { Menu } from './Menu'
import { SidebarPlaylists } from './SidebarPlaylists'

export function LeftSidebar() {
	const { t } = useTranslation()

	return (
		<aside className="scrollbar-custom h-full overflow-y-auto border-r border-player-bg px-layout py-9">
			<Menu items={MENU_ITEMS} />

			<hr className="my-8 border-player-bg" />

			<Menu
				items={LIBRARY_MENU_ITEMS}
				title={t('nav.yourLibrary')}
				activeHighlight
			/>

			<hr className="my-8 border-player-bg" />

			<SidebarPlaylists />
		</aside>
	)
}
