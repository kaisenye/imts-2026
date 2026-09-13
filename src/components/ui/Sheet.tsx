import type { ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, onClose, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="safe-bottom relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--bg)] lg:max-w-lg lg:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)] px-4 py-3">
          <h2 className="text-[16px] font-semibold">{title}</h2>
          <button onClick={onClose} className="min-h-11 px-2 text-[15px] text-[var(--muted)]">
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
