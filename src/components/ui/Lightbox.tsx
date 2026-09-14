import { useEffect } from 'react'

interface Props {
  src: string | null
  alt?: string
  onClose: () => void
}

/**
 * Full-screen view of one image. The card thumbnail in a list is too small
 * to read a phone number off; tapping it must show the whole card.
 */
export function Lightbox({ src, alt = '', onClose }: Props) {
  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [src, onClose])

  if (!src) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image'}
      data-overlay="lightbox"
      onClick={onClose}
      className="animate-veil fixed inset-0 z-[60] flex items-center justify-center bg-[rgb(22_25_26/0.86)] p-4"
    >
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="animate-rise max-h-[92vh] max-w-full rounded-lg object-contain shadow-[0_12px_48px_rgb(0_0_0/0.5)]"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(255_255_255/0.12)] text-white transition-colors duration-150 hover:bg-[rgb(255_255_255/0.24)]"
        style={{ top: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
