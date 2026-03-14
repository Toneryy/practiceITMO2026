import type { ReactNode } from 'react'

interface Props {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	children: ReactNode
	confirmLabel?: string
	cancelLabel?: string
	variant?: 'danger' | 'default'
}

export function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title,
	children,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	variant = 'default'
}: Props) {
	if (!open) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-modal-title"
		>
			<div
				className="w-full max-w-md rounded-xl bg-[#2B2B30] p-6 shadow-xl"
				onClick={e => e.stopPropagation()}
			>
				<h2
					id="confirm-modal-title"
					className="text-xl font-bold text-white mb-2"
				>
					{title}
				</h2>
				<div className="text-neutral-400 text-sm mb-6">{children}</div>
				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/20 transition-colors"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={() => {
							onConfirm()
							onClose()
						}}
						className={
							variant === 'danger'
								? 'rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors'
								: 'rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black hover:opacity-90 transition-opacity'
						}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	)
}
