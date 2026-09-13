import { useCallback, useState, type FormEvent } from 'react'
import { useVoiceNote } from '../../hooks/useVoiceNote'
import { useLocale } from '../../i18n/LocaleContext'
import { Button } from '../ui/Button'

export function NoteComposer({ onAdd }: { onAdd: (body: string) => Promise<void> }) {
  const { t } = useLocale()
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dictated phrases append to whatever is already typed, so voice and
  // keyboard can be mixed in one note.
  const appendSpoken = useCallback((text: string) => {
    setBody((prev) => (prev ? `${prev.replace(/\s+$/, '')} ${text}` : text))
  }, [])

  const voice = useVoiceNote({ onText: appendSpoken })
  const listening = voice.state === 'listening' || voice.state === 'connecting'

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    if (listening) voice.stop()
    setSaving(true)
    setError(null)
    try {
      await onAdd(trimmed)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t.noteSaveFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-1">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={t.notePlaceholder}
          aria-label={t.noteLabel}
          className="
            w-full rounded-lg border border-[var(--line-strong)] bg-[var(--raised)] p-3 pr-12
            text-base leading-relaxed transition-colors duration-150
            placeholder:text-[var(--faint)] hover:border-[var(--muted)]
          "
        />

        {voice.supported && (
          <button
            type="button"
            onClick={() => (listening ? voice.stop() : void voice.start())}
            aria-label={listening ? t.dictateStop : t.dictate}
            title={listening ? t.dictateStop : t.dictate}
            className={`
              absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full
              transition-colors duration-150
              ${
                listening
                  ? 'bg-[var(--flag)] text-white'
                  : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
              }
            `}
          >
            {listening ? (
              <span className="block h-3 w-3 rounded-[2px] bg-current" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" fill="currentColor" />
                <path
                  d="M3 7.5a5 5 0 0 0 10 0M8 12.5V15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {listening && (
        <p className="mt-1.5 flex items-center gap-2 text-[13px] text-[var(--muted)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--flag)] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--flag)]" />
          </span>
          {voice.state === 'connecting' ? t.connecting : voice.partial || t.listening}
        </p>
      )}

      {voice.error && <p className="mt-1.5 text-[13px] text-[var(--flag)]">{voice.error}</p>}
      {error && <p className="mt-1.5 text-[14px] text-[var(--flag)]">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        disabled={saving || !body.trim()}
        className="mt-2 w-full"
      >
        {saving ? t.saving : t.addNote}
      </Button>
    </form>
  )
}
