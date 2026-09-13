import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  /** Rendered in the sticky footer — the primary action for this record. */
  footer?: ReactNode
}

/**
 * One detail surface, two shapes: a bottom sheet under lg, a right-hand side
 * panel from lg up. Opening a record must never reflow the list behind it —
 * on a show floor you lose your place in 88 rows and cannot find it again.
 */
export function Panel({ open, title, subtitle, onClose, children, footer }: Props) {
  // Escape closes; body scroll locks so the list behind doesn't drift.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-veil absolute inset-0 h-full w-full cursor-default bg-[rgb(22_25_26/0.34)]"
      />

      <div
        className="
          animate-sheet lg-slide-x absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col
          rounded-t-2xl border-t border-[var(--line-strong)] bg-[var(--raised)]
          shadow-[var(--shadow-sheet)]
          lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[440px]
          lg:rounded-none lg:border-t-0 lg:border-l
        "
      >
        {/* Grab handle reads as 'draggable' on a phone; pointless on desktop. */}
        <div className="flex justify-center pt-2 lg:hidden">
          <span className="h-1 w-9 rounded-full bg-[var(--line-strong)]" />
        </div>

        <header className="flex items-start gap-3 border-b border-[var(--line)] px-5 pb-3 pt-3 lg:pt-5">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[21px] leading-tight tracking-[-0.01em]">{title}</h2>
            {subtitle && <div className="mt-1 text-[13px] text-[var(--muted)]">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="
              -mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full
              text-[var(--muted)] transition-colors duration-150
              hover:bg-[var(--surface)] hover:text-[var(--ink)]
            "
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="safe-bottom min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer && (
          <div className="footer-pad border-t border-[var(--line)] bg-[var(--raised)] px-5 pt-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
