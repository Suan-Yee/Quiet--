import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastVariant = 'error' | 'success'

type ToastProps = {
  title: string
  messages?: string[]
  variant?: ToastVariant
  onClose: () => void
}

const toastVariants: Record<ToastVariant, string> = {
  error: 'border-[var(--color-danger)]/30 bg-[var(--color-card)]',
  success: 'border-[var(--color-border)] bg-[var(--color-card)]',
}

const iconVariants: Record<ToastVariant, string> = {
  error: 'border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  success: 'border-[var(--color-accent)]/25 bg-[var(--color-soft-accent)] text-[var(--color-success)]',
}

function Toast({ title, messages = [], variant = 'error', onClose }: ToastProps) {
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[120] sm:left-auto sm:right-6 sm:bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:w-full sm:max-w-md"
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm text-[var(--color-text)] shadow-xl shadow-[rgb(var(--shadow-color)/0.16)] backdrop-blur ${toastVariants[variant]}`}
      >
        <span
          className={`mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border ${iconVariants[variant]}`}
        >
          <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-[var(--color-text)]">{title}</p>
          {messages.length > 0 ? (
            <ul className="mt-1.5 space-y-1 text-[var(--color-secondary)]">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          aria-label="Dismiss notification"
          className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg text-[var(--color-secondary)] transition duration-200 hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          type="button"
          onClick={onClose}
        >
          <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}

export default Toast
