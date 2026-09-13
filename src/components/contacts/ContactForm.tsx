import { useState, type FormEvent } from 'react'
import type { ContactDraft } from '../../lib/ocrMerge'
import { Field, TextArea } from '../ui/Field'
import { Button } from '../ui/Button'

interface Props {
  draft: ContactDraft
  onChange: (draft: ContactDraft) => void
  onSubmit: () => Promise<void>
  onCancel: () => void
  busy?: boolean
}

export function ContactForm({ draft, onChange, onSubmit, onCancel, busy }: Props) {
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.name.trim() && !draft.email.trim() && !draft.phone.trim()) {
      setError('Add at least a name, email, or phone.')
      return
    }
    setError(null)
    await onSubmit()
  }

  const set = (key: keyof ContactDraft) => (value: string) => onChange({ ...draft, [key]: value })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Name" value={draft.name} onChange={(e) => set('name')(e.target.value)} autoComplete="name" />
      <Field label="Title" value={draft.title} onChange={(e) => set('title')(e.target.value)} />
      <Field label="Company" value={draft.company_name} onChange={(e) => set('company_name')(e.target.value)} />
      <Field
        label="Email"
        type="email"
        inputMode="email"
        value={draft.email}
        onChange={(e) => set('email')(e.target.value)}
      />
      <Field
        label="Phone"
        type="tel"
        inputMode="tel"
        value={draft.phone}
        onChange={(e) => set('phone')(e.target.value)}
      />
      <TextArea label="Notes" rows={3} value={draft.notes} onChange={(e) => set('notes')(e.target.value)} />
      {error && <p className="text-[14px] text-[#b3372e]">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy} className="flex-1">
          {busy ? 'Saving…' : 'Save contact'}
        </Button>
      </div>
    </form>
  )
}
