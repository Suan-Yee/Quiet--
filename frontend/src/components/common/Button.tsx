import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonStyles, type ButtonVariant } from './buttonStyles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
}

function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button className={buttonStyles(variant, className)} {...props}>
      {children}
    </button>
  )
}

export default Button
