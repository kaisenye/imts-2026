import { Button } from './Button'

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="animate-rise flex items-start gap-3 rounded-lg border border-[var(--flag)]/35 bg-[var(--flag-soft)] p-3.5 text-[14px] text-[var(--flag)]">
      <span className="min-w-0 flex-1 leading-snug">{message}</span>
      {onRetry && (
        <Button onClick={onRetry} className="min-h-9 shrink-0 px-3 py-0 text-[13px]">
          Retry
        </Button>
      )}
    </div>
  )
}
