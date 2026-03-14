import { ConfirmModal } from '@/components/ui/confirm-modal/ConfirmModal'
import { CustomMenu } from '@/components/ui/custom-menu/CustomMenu'
import { PagesConfig } from '@/config/pages.config'
import { playlistStore } from '@/store/playlist.store'
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

export const SidebarPlaylists = observer(function SidebarPlaylists() {
	const [value, setValue] = useState('')
	const [isShow, setIsShow] = useState(false)
	const [optionsMenuPlaylist, setOptionsMenuPlaylist] = useState<string | null>(
		null
	)
	const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isShow && !optionsMenuPlaylist) return

		const handleMouseDown = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsShow(false)
				setValue('')
				setOptionsMenuPlaylist(null)
			}
		}

		document.addEventListener('mousedown', handleMouseDown)
		return () => document.removeEventListener('mousedown', handleMouseDown)
	}, [isShow, optionsMenuPlaylist])

	return (
		<div ref={containerRef}>
			<div className="text-xs uppercase text-neutral-500 mb-3">Playlists</div>
			{playlistStore.playlists.length === 0 ? (
				<div className="text-neutral-400 text-sm mb-5">No playlists yet</div>
			) : (
				<ul className="mb-5">
					{playlistStore.playlists.map(playlist => (
						<li
							key={playlist.name}
							className="group flex items-center gap-1 mb-5"
						>
							<NavLink
								to={PagesConfig.PLAYLIST(encodeURIComponent(playlist.name))}
								className={({ isActive }) =>
									`flex-1 min-w-0 truncate rounded-md py-1.5 px-2 -mx-2 transition ${
										isActive
											? 'bg-white/10 text-white font-semibold'
											: 'text-neutral-400 hover:bg-white/5 hover:text-white'
									}`
								}
							>
								<span className="group-hover:text-primary duration-300 font-medium block truncate">
									{playlist.name}
								</span>
							</NavLink>
							<div className="relative shrink-0">
								<button
									type="button"
									onClick={e => {
										e.preventDefault()
										setOptionsMenuPlaylist(
											optionsMenuPlaylist === playlist.name ? null : playlist.name
										)
									}}
									className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity text-neutral-400 hover:text-white"
									title="Options"
								>
									<MoreHorizontal size={16} />
								</button>
								{optionsMenuPlaylist === playlist.name && (
									<CustomMenu side="right">
										<button
											type="button"
											onClick={() => {
												setOptionsMenuPlaylist(null)
												setPlaylistToDelete(playlist.name)
											}}
											className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10"
										>
											<Trash2 size={16} />
											Delete
										</button>
									</CustomMenu>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
			<div className="relative">
				<button
					className="flex gap-1.5 bg-zinc-700/30 py-2 px-3.5 rounded-md duration-300 transition-colors hover:bg-zinc-700/50"
					onClick={() => setIsShow(prev => !prev)}
				>
					<Plus /> <span>New Playlist</span>
				</button>

				{isShow && (
					<CustomMenu side="left">
						<input
							autoFocus
							type="text"
							placeholder="Playlist name"
							value={value}
							onChange={e => setValue(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter' && value.trim()) {
									playlistStore.createPlaylist(value.trim())
									setValue('')
									setIsShow(false)
								}
							}}
							className="rounded-md px-3 py-2 w-full"
						/>
					</CustomMenu>
				)}
			</div>

			{playlistToDelete && (
				<ConfirmModal
					open={!!playlistToDelete}
					onClose={() => setPlaylistToDelete(null)}
					onConfirm={() => {
						playlistStore.deletePlaylist(playlistToDelete)
						setPlaylistToDelete(null)
					}}
					title="Delete playlist?"
					confirmLabel="Delete"
					cancelLabel="Cancel"
					variant="danger"
				>
					Are you sure you want to delete &quot;{playlistToDelete}&quot;? This
					cannot be undone.
				</ConfirmModal>
			)}
		</div>
	)
})
