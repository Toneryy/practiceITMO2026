import { observer } from 'mobx-react-lite'
import { authStore } from '@/store/auth.store'
import { languageStore } from '@/store/language.store'
import { CustomMenu } from '@/components/ui/custom-menu/CustomMenu'
import { User, LogIn, Loader2, LogOut, Globe, UserCircle, Settings, Menu } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

interface HeaderProps {
	onMenuClick?: () => void
}

export const Header = observer(function Header({ onMenuClick }: HeaderProps) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!menuOpen) return
		const handleMouseDown = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', handleMouseDown)
		return () => document.removeEventListener('mousedown', handleMouseDown)
	}, [menuOpen])

	if (authStore.isLoading) {
		return (
			<header className="flex items-center justify-between gap-4 px-4 pb-3 pt-6 sm:justify-end sm:px-6 sm:pt-9">
				{onMenuClick && (
					<button
						type="button"
						onClick={onMenuClick}
						className="flex md:hidden size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white transition hover:bg-white/10"
						aria-label="Open menu"
					>
						<Menu size={20} />
					</button>
				)}
				<div className="flex flex-1 justify-end">
					<Loader2 size={20} className="animate-spin text-neutral-400" />
				</div>
			</header>
		)
	}

	const nextLang = languageStore.language === 'en' ? 'ru' : 'en'
	const langLabel = languageStore.language === 'en' ? 'Русский' : 'English'

	return (
		<header className="flex items-center justify-between gap-4 px-4 pb-3 pt-6 sm:justify-end sm:px-6 sm:pt-9">
			{onMenuClick && (
				<button
					type="button"
					onClick={onMenuClick}
					className="flex md:hidden h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/10"
					aria-label="Open menu"
				>
					<Menu size={22} />
				</button>
			)}
			{authStore.isAuthenticated ? (
				<div ref={containerRef} className="relative">
					<button
						type="button"
						onClick={() => setMenuOpen(prev => !prev)}
						className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 transition hover:bg-white/10"
					>
						{authStore.user?.avatar ? (
							<img
								src={authStore.user.avatar}
								alt={authStore.user.username}
								className="h-7 w-7 rounded-full object-cover"
							/>
						) : (
							<div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
								<User size={16} />
							</div>
						)}
						<span className="text-sm font-medium text-white">
							{authStore.user?.username}
						</span>
					</button>

					{menuOpen && (
						<CustomMenu side="right">
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false)
									navigate('/profile')
								}}
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
							>
								<UserCircle size={16} />
								{t('profile.title')}
							</button>
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false)
									navigate('/settings')
								}}
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
							>
								<Settings size={16} />
								{t('settings.title')}
							</button>
							<button
								type="button"
								onClick={() => {
									languageStore.setLanguage(nextLang)
									setMenuOpen(false)
								}}
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-white/10"
							>
								<Globe size={16} />
								{langLabel}
							</button>
							<hr className="my-1 border-white/10" />
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false)
									authStore.logout()
									navigate('/')
								}}
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10"
							>
								<LogOut size={16} />
								{t('auth.logout')}
							</button>
						</CustomMenu>
					)}
				</div>
			) : (
				<Link
					to="/login"
					className="flex items-center gap-2 rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-black transition hover:scale-105 hover:bg-white/90"
				>
					<LogIn size={16} />
					{t('auth.login')}
				</Link>
			)}
		</header>
	)
})
