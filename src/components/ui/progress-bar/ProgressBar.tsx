import { useEffect, useRef, useState } from 'react'
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
	const barRef = useRef<HTMLDivElement>(null)
	const [isDragging, setIsDragging] = useState(false)

	const getValueFromEvent = (e: React.MouseEvent | MouseEvent) => {
		const rect = barRef.current?.getBoundingClientRect()
		if (!rect || value <= 0) return currentValue
		const x = e.clientX - rect.left
		const pct = Math.max(0, Math.min(1, x / rect.width))
		return Math.round(pct * value)
	}

	const handlePointerDown = (e: React.PointerEvent) => {
		e.preventDefault()
		setIsDragging(true)
		onSeek(getValueFromEvent(e))
	}

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!isDragging) return
		onSeek(getValueFromEvent(e))
	}

	const handlePointerUp = () => {
		setIsDragging(false)
	}

	useEffect(() => {
		if (!isDragging) return
		const onMove = (e: MouseEvent) => {
			const rect = barRef.current?.getBoundingClientRect()
			if (!rect || value <= 0) return
			const x = e.clientX - rect.left
			const pct = Math.max(0, Math.min(1, x / rect.width))
			onSeek(Math.round(pct * value))
		}
		const onUp = () => setIsDragging(false)
		window.addEventListener('pointermove', onMove)
		window.addEventListener('pointerup', onUp)
		return () => {
			window.removeEventListener('pointermove', onMove)
			window.removeEventListener('pointerup', onUp)
		}
	}, [isDragging, value, onSeek])

	return (
		<div className="group flex w-full items-center gap-6">
			{isTextDisplayed && (
				<span className="w-5 shrink-0 text-right text-xs text-zinc-400 tabular-nums">
					{transformDuration(currentValue)}
				</span>
			)}

			<div
				ref={barRef}
				role="slider"
				aria-valuemin={0}
				aria-valuemax={value}
				aria-valuenow={currentValue}
				tabIndex={0}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onKeyDown={e => {
					const step = value > 60 ? 5 : 1
					if (e.key === 'ArrowRight') onSeek(Math.min(value, currentValue + step))
					if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentValue - step))
				}}
				className={`relative flex h-8 w-full cursor-pointer select-none items-center ${isDragging ? 'cursor-grabbing' : ''}`}
			>
				<div className="absolute inset-0 flex items-center">
					<div className="h-1 w-full rounded-full bg-white/10" />
					<div
						className="absolute left-0 h-1 rounded-full bg-primary"
						style={{ width: `${progress}%` }}
					/>
					{isThumbDisplayed && (
						<div
							className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md opacity-0 transition-opacity group-hover:opacity-100"
							style={{ left: `${progress}%` }}
						/>
					)}
				</div>
			</div>

			{isTextDisplayed && (
				<span className="w-5 shrink-0 text-left text-xs text-zinc-500 tabular-nums">
					{transformDuration(value)}
				</span>
			)}
		</div>
	)
}
