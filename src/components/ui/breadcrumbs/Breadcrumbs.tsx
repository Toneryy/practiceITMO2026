import { Link } from 'react-router-dom'

interface Props {
	items: {
		label: string
		link?: string
	}[]
}

export function Breadcrumbs({ items }: Props) {
	return (
		<div className="text-sm text-neutral-400 mb-4 flex gap-2">
			{items.map((item, index) => {
				const isLast = index === items.length - 1

				return (
					<div
						key={index}
						className="flex gap-2"
					>
						{item.link && !isLast ? (
							<Link
								to={item.link}
								className="hover:text-white"
							>
								{item.label}
							</Link>
						) : (
							<span className="text-neutral-200">{item.label}</span>
						)}

						{!isLast && <span>/</span>}
					</div>
				)
			})}
		</div>
	)
}
