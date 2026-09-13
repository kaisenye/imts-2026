import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'

export function NoteComposer({ onAdd }: { onAdd: (body: string) => Promise<void> }) {
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      await onAdd(trimmed)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="What did they say?"
        aria-label="New note"
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-base"
      />
      {error && <p className="mt-1 text-[14px] text-[#b3372e]">{error}</p>}
      <Button type="submit" variant="primary" disabled={saving || !body.trim()} className="mt-2 w-full">
        {saving ? 'Saving…' : 'Add note'}
      </Button>
    </form>
  )
}
