import { Link } from 'react-router-dom'

interface Props {
	album: string
	cover: string
	artist: string
}

export function AlbumCard({ album, cover, artist }: Props) {
	return (
		<Link
			to={`/albums/${encodeURIComponent(album)}`}
			className="flex flex-col gap-3 rounded-lg p-4 transition hover:bg-neutral-800"
		>
			<img
				src={cover}
				alt={album}
				className="aspect-square w-full rounded-lg object-cover"
			/>
			<div>
				<div className="font-semibold">{album}</div>
				<div className="text-sm text-neutral-400">{artist}</div>
			</div>
		</Link>
	)
}
