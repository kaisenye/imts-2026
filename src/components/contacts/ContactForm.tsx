import { useMemo, useState, type FormEvent } from 'react'
import type { ContactDraft } from '../../lib/ocrMerge'
import type { Company } from '../../lib/types'
import { Field, TextArea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  draft: ContactDraft
  onChange: (draft: ContactDraft) => void
  onSubmit: () => Promise<void>
  onCancel: () => void
  busy?: boolean
  /** Targets the contact can be linked to. Omit to hide the picker. */
  companies?: Company[]
}

export function ContactForm({ draft, onChange, onSubmit, onCancel, busy, companies }: Props) {
  const { t } = useLocale()
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(
    () =>
      (companies ?? [])
        .filter((c) => !c.archived)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [companies],
  )

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

      {/* The link is what puts a contact in a target's panel. OCR pre-selects
          it when the card's company resolves to a known target; the rep can
          always override. */}
      {companies && (
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.07em] text-[var(--muted)]">
            {t.fieldLinkCompany}
          </span>
          <select
            value={draft.company_id ?? ''}
            onChange={(e) => onChange({ ...draft, company_id: e.target.value || null })}
            className="min-h-11 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--raised)] px-3 text-base text-[var(--ink)] transition-colors duration-150 hover:border-[var(--muted)]"
          >
            <option value="">{t.noLink}</option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

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
      {error && <p className="text-[14px] text-[var(--flag)]">{error}</p>}
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
