import { ConfirmModal } from '@/components/ui/confirm-modal/ConfirmModal'
import { CustomMenu } from '@/components/ui/custom-menu/CustomMenu'
import { PagesConfig } from '@/config/pages.config'
import { TRACKS } from '@/data/tracks.data'
import { playlistStore } from '@/store/playlist.store'
import { playerStore } from '@/store/player.store'
import { MoreHorizontal, Pause, Pencil, Pin, Play, Plus, Trash2 } from 'lucide-react'
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
	const [renamingPlaylist, setRenamingPlaylist] = useState<string | null>(null)
	const [renameValue, setRenameValue] = useState('')
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isShow && !optionsMenuPlaylist && !renamingPlaylist) return

		const handleMouseDown = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsShow(false)
				setValue('')
				setOptionsMenuPlaylist(null)
				setRenamingPlaylist(null)
				setRenameValue('')
			}
		}

		document.addEventListener('mousedown', handleMouseDown)
		return () => document.removeEventListener('mousedown', handleMouseDown)
	}, [isShow, optionsMenuPlaylist, renamingPlaylist])

	return (
		<div ref={containerRef}>
			<div className="text-xs uppercase text-neutral-500 mb-3">Playlists</div>
			{playlistStore.sortedPlaylists.length === 0 ? (
				<div className="text-neutral-400 text-sm mb-5">No playlists yet</div>
			) : (
				<ul className="mb-5">
					{playlistStore.sortedPlaylists.map(playlist => (
						<li
							key={playlist.name}
							className="group flex items-center gap-2 mb-3"
						>
							<NavLink
								to={PagesConfig.PLAYLIST(encodeURIComponent(playlist.name))}
								className={({ isActive }) =>
									`flex flex-1 min-w-0 items-center gap-2 rounded-md py-1.5 px-2 -mx-2 transition ${
										isActive
											? 'bg-white/10 text-white font-semibold'
											: 'text-neutral-400 hover:bg-white/5 hover:text-white'
									}`
								}
							>
								<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gradient-to-br from-zinc-600 to-zinc-800">
									<img
										src="https://picsum.photos/seed/playlist/80/80"
										alt=""
										className="h-full w-full object-cover transition group-hover:brightness-75"
									/>
									{playlist.tracks.length > 0 && (() => {
										const tracks = TRACKS.filter(t =>
											playlist.tracks.includes(t.name)
										)
										const isPlayingFromPlaylist =
											playerStore.currentTrack &&
											playlist.tracks.includes(
												playerStore.currentTrack.name
											) &&
											playerStore.isPlaying
										return (
											<button
												type="button"
												onClick={e => {
													e.preventDefault()
													e.stopPropagation()
													if (isPlayingFromPlaylist) {
														playerStore.pause()
													} else if (tracks.length > 0) {
														playerStore.setTrack(
															tracks[0],
															tracks
														)
														playerStore.play()
													}
												}}
												className="absolute inset-0 flex items-center justify-center rounded text-white opacity-0 transition group-hover:opacity-100"
												title={isPlayingFromPlaylist ? 'Pause' : 'Play'}
											>
												{isPlayingFromPlaylist ? (
													<Pause
														size={20}
														className="fill-current"
													/>
												) : (
													<Play
														size={20}
														className="ml-0.5 fill-current"
													/>
												)}
											</button>
										)
									})()}
								</div>
								<div className="flex min-w-0 flex-1 flex-col gap-0.5">
									<span className="group-hover:text-primary truncate font-medium duration-300">
										{playlist.name}
									</span>
									<span className="flex items-center gap-1.5 text-xs text-neutral-500">
										{playlistStore.isPinned(playlist.name) && (
											<Pin size={12} className="shrink-0 text-primary" />
										)}
										Плейлист · {playlist.tracks.length}
									</span>
								</div>
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
												setRenamingPlaylist(playlist.name)
												setRenameValue(playlist.name)
											}}
											className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
										>
											<Pencil size={16} />
											Rename
										</button>
										<button
											type="button"
											onClick={() => {
												playlistStore.togglePinned(playlist.name)
											}}
											className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10 ${playlistStore.isPinned(playlist.name) ? 'text-primary' : ''}`}
										>
											<Pin size={16} />
											{playlistStore.isPinned(playlist.name)
												? 'Unpin'
												: 'Pin to top'}
										</button>
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

			{renamingPlaylist && (
				<div className="mt-2">
					<input
						autoFocus
						type="text"
						placeholder="New name"
						value={renameValue}
						onChange={e => setRenameValue(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter' && renameValue.trim()) {
								playlistStore.renamePlaylist(renamingPlaylist, renameValue.trim())
								setRenamingPlaylist(null)
								setRenameValue('')
							}
							if (e.key === 'Escape') {
								setRenamingPlaylist(null)
								setRenameValue('')
							}
						}}
						className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-primary focus:outline-none"
					/>
				</div>
			)}

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
