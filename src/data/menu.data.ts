import type { IMenuItem } from '@/types/menu.types'
import { Compass, Home, Radio } from 'lucide-react'
import { PagesConfig } from '../config/pages.config'

export const MENU_ITEMS: IMenuItem[] = [
	{
		icon: Home,
		name: 'Home',
		link: PagesConfig.HOME
	},
	{
		icon: Compass,
		name: 'Discover',
		link: PagesConfig.DISCOVER
	},
	{
		icon: Radio,
		name: 'Radio',
		link: PagesConfig.RADIO
	}
]

export const LIBRARY_MENU_ITEMS: IMenuItem[] = [
	{
		name: 'Made For You',
		link: PagesConfig.MADE_FOR_YOU
	},
	{
		name: 'Recently Played',
		link: PagesConfig.RECENTLY_PLAYED
	},
	{
		name: 'Liked Songs',
		link: PagesConfig.LIKED_SONGS
	},
	{
		name: 'Albums',
		link: PagesConfig.ALBUMS()
	},
	{
		name: 'Artists',
		link: PagesConfig.ARTISTS()
	},
	{
		name: 'Podcasts',
		link: PagesConfig.PODCASTS()
	}
]
