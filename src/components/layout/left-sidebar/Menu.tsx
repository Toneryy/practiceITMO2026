import type { IMenuItem } from '@/types/menu.types'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface Props {
	items: IMenuItem[]
	title?: string
	emptyLabel?: string
	children?: ReactNode
	activeHighlight?: boolean
}

export function Menu({ items, title, emptyLabel, children, activeHighlight }: Props) {
	return (
		<div>
			{title && (
				<div className="opacity-60 text-xxs uppercase font-medium mb-5">
					{title}
				</div>
			)}
			{items.length === 0 && (
				<div className="text-neutral-400 text-sm">
					{emptyLabel ?? 'No items found'}
				</div>
			)}
			<ul>
				{items.map(item => (
					<li key={item.name}>
						<NavLink
							to={item.link ? item.link : '#'}
							className={({ isActive }) =>
								`flex gap-3 items-center mb-5 group transition rounded-md py-1.5 px-2 -mx-2 ${
									activeHighlight
										? isActive
											? 'bg-white/10 text-white font-semibold'
											: 'text-neutral-400 hover:bg-white/5 hover:text-white'
										: isActive
											? 'text-white font-semibold'
											: 'text-neutral-400 hover:text-white'
								}`
							}
						>
							{item.icon && (
								<item.icon className="group-hover:text-primary duration-300" />
							)}
							<span className="group-hover:text-primary duration-300 font-medium">
								{item.name}
							</span>
						</NavLink>
					</li>
				))}
			</ul>
			{children}
		</div>
	)
}
