import type { IArtist } from '@/types/artist.types'
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Props {
	artist: IArtist
}

export function ArtistCard({ artist }: Props) {
	const [imageError, setImageError] = useState(false)
	const showFallback = !artist.image || imageError

	return (
		<Link
			to={`/artists/${encodeURIComponent(artist.name)}`}
			className="flex flex-col items-center gap-3 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:bg-neutral-800 hover:shadow-lg"
		>
			{showFallback ? (
				<div
					className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-4xl font-bold text-white"
					aria-hidden
				>
					{artist.name.charAt(0).toUpperCase()}
				</div>
			) : (
				<img
					src={artist.image}
					alt={artist.name}
					className="h-32 w-32 shrink-0 rounded-full object-cover"
					onError={() => setImageError(true)}
				/>
			)}
			<div className="text-center">
				<div className="font-bold">{artist.name}</div>
				<div className="text-xs text-zinc-400">
					{artist.listenersCount.toLocaleString()} listeners
				</div>
			</div>
		</Link>
	)
}
