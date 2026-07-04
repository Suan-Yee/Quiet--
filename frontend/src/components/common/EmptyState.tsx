import type { ReactNode } from 'react'
import Card from './Card'

type EmptyStateProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

function EmptyState({ eyebrow = 'Nothing here yet', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <Card className={`mx-auto max-w-xl p-8 text-center sm:p-10 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{eyebrow}</p>
      <h2 className="mt-3 font-reading text-3xl font-bold leading-tight text-[var(--color-text)]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-secondary)]">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  )
}

export default EmptyState
