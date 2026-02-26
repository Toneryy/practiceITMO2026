export const transformDuration = (duration?: number) => {
	if (!duration && duration !== 0) return '0:00'

	const minutes = Math.floor(duration / 60)
	const seconds = duration % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
