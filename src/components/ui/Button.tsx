import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
}

const STYLES = {
  primary: 'bg-[var(--color-accent)] text-white border-transparent',
  ghost: 'bg-transparent text-[var(--ink)] border-[var(--line)]',
  danger: 'bg-transparent text-[#b3372e] border-[var(--line)]',
}

export function Button({ variant = 'ghost', className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`min-h-11 rounded-lg border px-4 text-[15px] font-medium disabled:opacity-50 ${STYLES[variant]} ${className}`}
    />
  )
}
