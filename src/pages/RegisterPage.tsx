import { authStore } from '@/store/auth.store'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, Music } from 'lucide-react'

export const RegisterPage = observer(function RegisterPage() {
	const { t } = useTranslation()
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<{
		username?: string
		email?: string
		password?: string
	}>({})

	if (authStore.isAuthenticated) {
		return <Navigate to="/" replace />
	}

	const validate = () => {
		const e: typeof errors = {}
		if (!username.trim()) e.username = t('auth.validationUsername')
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!email.trim() || !emailRegex.test(email)) e.email = t('auth.validationEmail')
		if (!password || password.length < 6) e.password = t('auth.validationPassword')
		setErrors(e)
		return Object.keys(e).length === 0
	}

	const handleSubmit = async (ev: React.FormEvent) => {
		ev.preventDefault()
		if (!validate()) return
		await authStore.register(username.trim(), email.trim().toLowerCase(), password)
	}

	return (
		<div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
			<div className="w-full max-w-sm rounded-2xl bg-[#1e1e24] p-8 shadow-2xl">
				<div className="mb-6 flex flex-col items-center gap-2">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
						<Music className="text-primary" size={24} />
					</div>
					<h1 className="text-xl font-bold text-white sm:text-2xl">{t('auth.registerTitle')}</h1>
					<p className="text-sm text-neutral-400">{t('auth.registerSubtitle')}</p>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-400">
							{t('auth.username')}
						</label>
						<input
							type="text"
							value={username}
							onChange={e => setUsername(e.target.value)}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-primary"
							placeholder="cooluser42"
							autoComplete="username"
						/>
						{errors.username && (
							<p className="mt-1 text-xs text-red-400">{errors.username}</p>
						)}
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-400">
							{t('auth.email')}
						</label>
						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-primary"
							placeholder="you@example.com"
							autoComplete="email"
						/>
						{errors.email && (
							<p className="mt-1 text-xs text-red-400">{errors.email}</p>
						)}
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-400">
							{t('auth.password')}
						</label>
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-primary"
							placeholder="••••••••"
							autoComplete="new-password"
						/>
						{errors.password && (
							<p className="mt-1 text-xs text-red-400">{errors.password}</p>
						)}
					</div>

					{authStore.error && (
						<p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
							{authStore.error}
						</p>
					)}

					<button
						type="submit"
						disabled={authStore.isLoading}
						className="flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
					>
						{authStore.isLoading && <Loader2 size={16} className="animate-spin" />}
						{t('auth.register')}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-neutral-400">
					{t('auth.hasAccount')}{' '}
					<Link to="/login" className="font-medium text-primary hover:underline">
						{t('auth.login')}
					</Link>
				</p>
			</div>
		</div>
	)
})
