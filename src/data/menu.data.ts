import type { IMenuItem } from '@/types/menu.types'
import { Compass, Disc3, Heart, Home, Music2, Search } from 'lucide-react'
import { PagesConfig } from '../config/pages.config'

export const MENU_ITEMS: IMenuItem[] = [
	{
		icon: Home,
		name: 'nav.home',
		link: PagesConfig.HOME
	},
	{
		icon: Search,
		name: 'nav.search',
		link: '/search'
	},
	{
		icon: Compass,
		name: 'nav.discover',
		link: '/discover'
	},
	{
		icon: Music2,
		name: 'nav.artists',
		link: PagesConfig.ARTISTS()
	},
	{
		icon: Heart,
		name: 'nav.likedSongs',
		link: PagesConfig.LIKED_SONGS
	},
	{
		icon: Disc3,
		name: 'nav.albums',
		link: '/albums'
	}
]

export const LIBRARY_MENU_ITEMS: IMenuItem[] = [
	{
		name: 'nav.madeForYou',
		link: PagesConfig.MADE_FOR_YOU
	},
	{
		name: 'nav.recentlyPlayed',
		link: PagesConfig.RECENTLY_PLAYED
	}
]
