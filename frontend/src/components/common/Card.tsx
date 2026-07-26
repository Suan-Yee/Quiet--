import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_18px_50px_-38px_rgb(var(--shadow-color)/0.45)] ${className}`}>
      {children}
    </section>
  )
}

export default Card
