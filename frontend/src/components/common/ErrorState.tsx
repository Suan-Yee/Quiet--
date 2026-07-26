import type { ReactNode } from 'react'
import Card from './Card'

type ErrorStateProps = {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <Card className={`mx-auto max-w-xl border-[var(--color-danger)]/30 bg-[var(--color-card)] p-8 text-center sm:p-10 ${className}`}>
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-danger-soft)] text-sm font-bold text-[var(--color-danger)]">
        !
      </div>
      <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--color-text)]">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-secondary)]">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  )
}

export default ErrorState
