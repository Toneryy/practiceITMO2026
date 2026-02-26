import { Search } from 'lucide-react'
import type { ChangeEvent } from 'react'

interface Props {
	value: string
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function SearchField({ onChange, value }: Props) {
	return (
		<div>
			<label className="flex items-center gap-3 group">
				<Search className="opacity-40 group-focus-within:opacity-100 duration-300" />
				<input
					type="search"
					placeholder="Search for songs, artists, etc..."
					className="bg-transparent w-full outline-none"
					value={value}
					onChange={onChange}
				/>
			</label>
		</div>
	)
}
