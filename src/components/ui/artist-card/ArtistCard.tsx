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
			className="flex flex-col items-center gap-2 rounded-lg p-3 transition-all duration-300 hover:scale-105 hover:bg-neutral-800 hover:shadow-lg sm:gap-3 sm:p-4"
		>
			{showFallback ? (
				<div
					className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-2xl font-bold text-white sm:h-28 sm:w-28 sm:text-3xl lg:h-32 lg:w-32 lg:text-4xl"
					aria-hidden
				>
					{artist.name.charAt(0).toUpperCase()}
				</div>
			) : (
				<img
					key={artist.image}
					src={artist.image}
					alt={artist.name}
					className="h-20 w-20 shrink-0 rounded-full object-cover sm:h-28 sm:w-28 lg:h-32 lg:w-32"
					onError={() => setImageError(true)}
				/>
			)}
			<div className="text-center min-w-0">
				<div className="truncate font-bold text-sm sm:text-base">{artist.name}</div>
				<div className="text-[10px] text-zinc-400 sm:text-xs">
					{artist.listenersCount.toLocaleString()} listeners
				</div>
			</div>
		</Link>
	)
}
