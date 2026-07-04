import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
}

const baseButtonStyles =
  'inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-accent)] text-white shadow-sm shadow-[#FF6719]/20 hover:bg-[var(--color-accent-hover)] hover:shadow-md hover:shadow-[#FF6719]/20',
  secondary: 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] shadow-sm shadow-[#1F2933]/5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-accent)] dark:shadow-black/10',
  ghost: 'text-[var(--color-secondary)] hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]',
}

export function buttonStyles(variant: ButtonVariant = 'primary', className = '') {
  return `${baseButtonStyles} ${buttonVariants[variant]} ${className}`
}

function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button className={buttonStyles(variant, className)} {...props}>
      {children}
    </button>
  )
}

export default Button
