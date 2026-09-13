import { useState, type FormEvent } from 'react'
import type { ContactDraft } from '../../lib/ocrMerge'
import { Field, TextArea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  draft: ContactDraft
  onChange: (draft: ContactDraft) => void
  onSubmit: () => Promise<void>
  onCancel: () => void
  busy?: boolean
}

export function ContactForm({ draft, onChange, onSubmit, onCancel, busy }: Props) {
  const { t } = useLocale()
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.name.trim() && !draft.email.trim() && !draft.phone.trim()) {
      setError(t.contactNeedsOne)
      return
    }
    setError(null)
    await onSubmit()
  }

  const set = (key: keyof ContactDraft) => (value: string) => onChange({ ...draft, [key]: value })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label={t.fieldName} value={draft.name} onChange={(e) => set('name')(e.target.value)} autoComplete="name" />
      <Field label={t.fieldTitle} value={draft.title} onChange={(e) => set('title')(e.target.value)} />
      <Field label={t.fieldCompany} value={draft.company_name} onChange={(e) => set('company_name')(e.target.value)} />
      <Field
        label={t.fieldEmail}
        type="email"
        inputMode="email"
        value={draft.email}
        onChange={(e) => set('email')(e.target.value)}
      />
      <Field
        label={t.fieldPhone}
        type="tel"
        inputMode="tel"
        value={draft.phone}
        onChange={(e) => set('phone')(e.target.value)}
      />
      <TextArea label={t.fieldNotes} rows={3} value={draft.notes} onChange={(e) => set('notes')(e.target.value)} />
      {error && <p className="text-[14px] text-[#b3372e]">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" onClick={onCancel} className="flex-1">
          {t.cancel}
        </Button>
        <Button type="submit" variant="primary" disabled={busy} className="flex-1">
          {busy ? t.saving : t.saveContact}
        </Button>
      </div>
    </form>
  )
}
