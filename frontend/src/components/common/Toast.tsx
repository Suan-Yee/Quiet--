import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastVariant = 'error' | 'success'

type ToastProps = {
  title: string
  messages?: string[]
  variant?: ToastVariant
  onClose: () => void
}

const toastVariants: Record<ToastVariant, string> = {
  error: 'border-[#EBCAB8] bg-[#FFFDF9]',
  success: 'border-[#E8E1D8] bg-white',
}

const iconVariants: Record<ToastVariant, string> = {
  error: 'border-[#FFD8C3] bg-[#FFF1E8] text-[#FF6719]',
  success: 'border-[#D9E7D1] bg-[#F4FAEF] text-[#4F7D45]',
}

function Toast({ title, messages = [], variant = 'error', onClose }: ToastProps) {
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:top-6"
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-xl shadow-[#1F2933]/10 backdrop-blur ${toastVariants[variant]}`}
      >
        <span
          className={`mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border ${iconVariants[variant]}`}
        >
          <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1F2933]">{title}</p>
          {messages.length > 0 ? (
            <ul className="mt-1.5 space-y-1 text-[#6B7280]">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          aria-label="Dismiss notification"
          className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-[#6B7280] transition duration-200 hover:bg-[#FFF1E8] hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#FF6719] focus:ring-offset-2 focus:ring-offset-[#FFFDF9]"
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
