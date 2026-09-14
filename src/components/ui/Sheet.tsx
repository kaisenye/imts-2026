import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Modal for forms and filters: bottom sheet on phone, centred card at lg.
 *
 * The sheet itself does not scroll. Children lay out as a column and put
 * their scrolling content in `SheetBody` and their button row in
 * `SheetActions`, so Cancel / Save stay pinned at the bottom instead of
 * scrolling away under a long form.
 */
export function Sheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      // A lightbox above this sheet owns Escape.
      if (e.key === 'Escape' && !document.querySelector('[data-overlay="lightbox"]')) onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
      role="dialog"
      aria-modal="true"
      data-overlay="sheet"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-veil absolute inset-0 h-full w-full cursor-default bg-[rgb(22_25_26/0.34)]"
      />
      <div
        className="
          animate-sheet relative flex max-h-[90vh] w-full flex-col
          rounded-t-2xl border-t border-[var(--line-strong)] bg-[var(--raised)]
          shadow-[var(--shadow-sheet)]
          lg:max-w-lg lg:rounded-2xl lg:border
        "
      >
        <div className="flex shrink-0 justify-center pt-2 lg:hidden">
          <span className="h-1 w-9 rounded-full bg-[var(--line-strong)]" />
        </div>
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <h2 className="font-display text-[17px]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="
              -mr-1 flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)]
              transition-colors duration-150 hover:bg-[var(--surface)] hover:text-[var(--ink)]
            "
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}

/** The scrolling part of a sheet. */
export function SheetBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-4 ${className}`}>
      {children}
    </div>
  )
}

/** The button row, pinned beneath the scrolling body. */
export function SheetActions({ children }: { children: ReactNode }) {
  return (
    <div className="footer-pad flex shrink-0 gap-3 border-t border-[var(--line)] bg-[var(--raised)] px-5 pt-3">
      {children}
    </div>
  )
}
