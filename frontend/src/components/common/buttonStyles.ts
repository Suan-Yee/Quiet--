export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const baseButtonStyles =
  'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white shadow-sm shadow-[rgb(var(--shadow-color)/0.14)] hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)] hover:shadow-md dark:text-[#0C1411]',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:-translate-y-0.5 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-card-elevated)]',
  ghost:
    'text-[var(--color-secondary)] hover:bg-[var(--color-soft-accent)] hover:text-[var(--color-text)]',
}

export function buttonStyles(variant: ButtonVariant = 'primary', className = '') {
  return `${baseButtonStyles} ${buttonVariants[variant]} ${className}`
}
