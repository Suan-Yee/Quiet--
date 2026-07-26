type LoadingSpinnerProps = {
  label?: string
  className?: string
}

function LoadingSpinner({ label = 'Loading', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm font-medium text-[var(--color-secondary)] ${className}`}>
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
