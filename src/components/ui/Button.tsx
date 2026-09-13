import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  /** Toggle buttons (hall, tier, status) use this for their on state. */
  selected?: boolean
}

const STYLES: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-[var(--accent)] text-white border-transparent hover:bg-[var(--accent-ink)]',
  ghost:
    'bg-[var(--raised)] text-[var(--ink)] border-[var(--line-strong)] hover:bg-[var(--surface)] hover:border-[var(--muted)]',
  danger:
    'bg-[var(--raised)] text-[var(--flag)] border-[var(--line-strong)] hover:bg-[var(--flag-soft)] hover:border-[var(--flag)]',
}

const SELECTED =
  'bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-ink)] hover:border-[var(--accent-ink)]'

export function Button({ variant = 'ghost', selected, className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      aria-pressed={selected}
      className={`
        min-h-11 rounded-lg border px-4 text-[15px] font-medium
        transition-[background-color,border-color,color,opacity] duration-150
        disabled:opacity-45 disabled:hover:bg-inherit
        ${selected ? SELECTED : STYLES[variant]} ${className}
      `}
    />
  )
}
