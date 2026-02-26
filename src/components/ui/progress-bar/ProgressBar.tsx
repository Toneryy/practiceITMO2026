import { transformDuration } from '@/utils/transform-duration'

interface Props {
	currentValue: number
	value: number
	progress: number
	onSeek: (time: number) => void
	isTextDisplayed?: boolean
	isThumbDisplayed?: boolean
}

export function ProgressBar({
	currentValue,
	value,
	progress,
	onSeek,
	isTextDisplayed,
	isThumbDisplayed = true
}: Props) {
	return (
		<div className="flex items-center gap-5">
			{isTextDisplayed && (
				<span className="w-10">{transformDuration(currentValue)}</span>
			)}

			<div className="bg-white/20 w-full rounded relative h-1">
				<div
					className="absolute top-0 left-0 h-full rounded bg-gradient-to-r from-primary to-secondary"
					style={{
						width: `${progress}%`
					}}
				/>

				{isThumbDisplayed && (
					<div
						className="w-3.5 h-3.5 bg-secondary rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
						style={{
							left: `${progress}%`
						}}
					/>
				)}

				<input
					type="range"
					min={0}
					max={value}
					className=""
					onChange={e => onSeek(+e.target.value)}
					value={currentValue}
				/>
			</div>

			{isTextDisplayed && (
				<span className="text-white/50">{transformDuration(value)}</span>
			)}
		</div>
	)
}
