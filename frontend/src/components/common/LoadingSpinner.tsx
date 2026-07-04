type LoadingSpinnerProps = {
  label?: string
  className?: string
}

function LoadingSpinner({ label = 'Loading', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm font-medium text-[#6B7280] ${className}`}>
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-[#E8E1D8] border-t-[#FF6719]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

export default LoadingSpinner
