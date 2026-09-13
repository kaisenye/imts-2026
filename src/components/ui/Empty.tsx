import type { ReactNode } from 'react'

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-[15px] text-[var(--muted)]">{children}</p>
}
