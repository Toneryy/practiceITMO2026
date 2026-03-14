import { Breadcrumbs } from '@/components/ui/breadcrumbs/Breadcrumbs'
import type { ReactNode } from 'react'

interface BreadcrumbItem {
	label: string
	link?: string
}

interface Props {
	title?: string
	breadcrumbs?: BreadcrumbItem[]
	children: ReactNode
}

export function PageContainer({ title, breadcrumbs, children }: Props) {
	return (
		<div className="px-8 py-6">
			{breadcrumbs && breadcrumbs.length > 0 && (
				<Breadcrumbs items={breadcrumbs} />
			)}
			{title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
			{children}
		</div>
	)
}
