import { Search } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
	value: string
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function SearchField({ onChange, value }: Props) {
	const { t } = useTranslation()

	return (
		<div className="mx-auto w-full max-w-5xl">
			<label className="flex items-center gap-3 rounded-full border border-transparent bg-white/5 px-4 py-2 duration-300 focus-within:border-primary/50 focus-within:bg-white/10 group">
				<Search
					size={22}
					className="shrink-0 opacity-40 duration-300 group-focus-within:opacity-100"
				/>
				<input
					type="search"
					placeholder={t('search.placeholder')}
					className="w-full bg-transparent text-sm outline-none placeholder:text-white/20"
					value={value}
					onChange={onChange}
				/>
			</label>
		</div>
	)
}
