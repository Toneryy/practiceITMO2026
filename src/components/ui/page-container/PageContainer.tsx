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
		<div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
			{breadcrumbs && breadcrumbs.length > 0 && (
				<Breadcrumbs items={breadcrumbs} />
			)}
			{title && <h1 className="mb-4 text-xl font-bold sm:mb-5 sm:text-2xl md:mb-6">{title}</h1>}
			{children}
		</div>
	)
}
