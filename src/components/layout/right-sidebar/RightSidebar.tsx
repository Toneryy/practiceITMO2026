import { Lyrics } from './Lyrics'

export function RightSidebar() {
	return (
		<div className="scrollbar-custom h-full overflow-y-auto bg-bg-secondary px-layout py-0">
			<Lyrics />
		</div>
	)
}
