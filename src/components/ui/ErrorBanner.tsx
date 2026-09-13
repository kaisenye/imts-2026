import { Button } from './Button'

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e9c9c6] bg-[#fdf3f2] p-3 text-[14px] text-[#b3372e]">
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button onClick={onRetry} className="min-h-9 px-3 text-[13px]">
          Retry
        </Button>
      )}
    </div>
  )
}
