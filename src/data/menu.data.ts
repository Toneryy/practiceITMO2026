import type { IMenuItem } from '@/types/menu.types'
import { Compass, Disc3, Heart, Home, Music2 } from 'lucide-react'
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
		link: '/discover'
	},
	{
		icon: Music2,
		name: 'Artists',
		link: PagesConfig.ARTISTS()
	},
	{
		icon: Heart,
		name: 'Liked Songs',
		link: PagesConfig.LIKED_SONGS
	},
	{
		icon: Disc3,
		name: 'Albums',
		link: '/albums'
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
	}
]
