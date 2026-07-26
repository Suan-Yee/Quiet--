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
    <Card className={`mx-auto max-w-xl border-dashed p-8 text-center sm:p-10 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--color-text)]">
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
