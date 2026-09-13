import type { ReactNode } from 'react'

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="animate-rise py-12 text-center text-[14.5px] text-[var(--muted)]">{children}</p>
  )
}
