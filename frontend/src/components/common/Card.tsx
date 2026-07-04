import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm shadow-[#1F2933]/5 dark:shadow-black/10 ${className}`}>
      {children}
    </section>
  )
}

export default Card
