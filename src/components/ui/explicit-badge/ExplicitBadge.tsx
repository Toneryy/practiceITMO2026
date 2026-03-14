interface Props {
	className?: string
}

/**
 * Small badge matching the Spotify / Apple Music style for explicit content.
 * Renders a dark rounded square with the letter "E".
 */
export function ExplicitBadge({ className }: Props) {
	return (
		<span
			className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-white/20 px-1 text-[10px] font-bold leading-none text-white/70 select-none ${className ?? ''}`}
			style={{ minWidth: '1rem', height: '1rem' }}
			title="Explicit content"
			aria-label="Explicit"
		>
			E
		</span>
	)
}
