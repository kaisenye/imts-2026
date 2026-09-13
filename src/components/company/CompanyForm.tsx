import { useState, type FormEvent } from 'react'
import type { Company, Tier } from '../../lib/types'
import { TIER_LABELS, TIER_ORDER } from '../../lib/types'
import { Field, TextArea } from '../ui/Field'
import { Button } from '../ui/Button'

interface Props {
  initial?: Company
  onSubmit: (patch: Partial<Company> & { name: string; tier: Tier }) => Promise<void>
  onCancel: () => void
}

export function CompanyForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [tier, setTier] = useState<Tier>(initial?.tier ?? 'A')
  const [booths, setBooths] = useState(initial?.booths.join(', ') ?? '')
  const [companyType, setCompanyType] = useState(initial?.company_type ?? '')
  const [hq, setHq] = useState(initial?.hq ?? '')
  const [ask, setAsk] = useState(initial?.ask ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        tier,
        booths: booths
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean),
        company_type: companyType.trim() || null,
        hq: hq.trim() || null,
        ask: ask.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Company name" value={name} onChange={(e) => setName(e.target.value)} required />
      <label className="block">
        <span className="mb-1 block text-[13px] text-[var(--muted)]">Tier</span>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as Tier)}
          className="min-h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base"
        >
          {TIER_ORDER.map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Booths (comma separated)"
        value={booths}
        onChange={(e) => setBooths(e.target.value)}
        placeholder="338536, 432212"
        inputMode="numeric"
      />
      <Field label="Type" value={companyType} onChange={(e) => setCompanyType(e.target.value)} placeholder="Importer" />
      <Field label="HQ" value={hq} onChange={(e) => setHq(e.target.value)} placeholder="Schaumburg, IL" />
      <TextArea label="The ask" value={ask} onChange={(e) => setAsk(e.target.value)} rows={3} />
      {error && <p className="text-[14px] text-[#b3372e]">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving} className="flex-1">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
