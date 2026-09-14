import { useState, type FormEvent } from 'react'
import type { Company, Tier } from '../../lib/types'
import { TIER_ORDER } from '../../lib/types'
import { Field, TextArea } from '../ui/Field'
import { Button } from '../ui/Button'
import { SheetActions, SheetBody } from '../ui/Sheet'
import { useLocale } from '../../i18n/LocaleContext'
import { tierLabel } from '../../i18n/company'

interface Props {
  initial?: Company
  onSubmit: (patch: Partial<Company> & { name: string; tier: Tier }) => Promise<void>
  onCancel: () => void
}

/** Rendered inside a Sheet: fields scroll, the button row stays put. */
export function CompanyForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useLocale()
  const [name, setName] = useState(initial?.name ?? '')
  const [tier, setTier] = useState<Tier>(initial?.tier ?? 'A')
  const [booths, setBooths] = useState(initial?.booths.join(', ') ?? '')
  const [companyType, setCompanyType] = useState(initial?.company_type ?? '')
  const [hq, setHq] = useState(initial?.hq ?? '')
  const [ask, setAsk] = useState(initial?.ask ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError(t.nameRequired)
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
        website: website.trim() || null,
        ask: ask.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="flex flex-col gap-4">
        <Field label={t.fieldCompanyName} value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.07em] text-[var(--muted)]">
            {t.fieldTier}
          </span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
            className="min-h-11 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--raised)] px-3 text-base text-[var(--ink)] transition-colors duration-150 hover:border-[var(--muted)]"
          >
            {TIER_ORDER.map((tierOpt) => (
              <option key={tierOpt} value={tierOpt}>
                {tierLabel(tierOpt, t)}
              </option>
            ))}
          </select>
        </label>
        <Field
          label={t.fieldBooths}
          value={booths}
          onChange={(e) => setBooths(e.target.value)}
          placeholder="338536, 432212"
          inputMode="numeric"
        />
        <Field label={t.fieldType} value={companyType} onChange={(e) => setCompanyType(e.target.value)} placeholder="Importer" />
        <Field label={t.fieldHq} value={hq} onChange={(e) => setHq(e.target.value)} placeholder="Schaumburg, IL" />
        <Field
          label={t.fieldWebsite}
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="yamazen.com"
        />
        <TextArea label={t.fieldAsk} value={ask} onChange={(e) => setAsk(e.target.value)} rows={3} />
        {error && <p className="text-[14px] text-[var(--flag)]">{error}</p>}
      </SheetBody>
      <SheetActions>
        <Button type="button" onClick={onCancel} className="flex-1">
          {t.cancel}
        </Button>
        <Button type="submit" variant="primary" disabled={saving} className="flex-1">
          {saving ? t.saving : t.save}
        </Button>
      </SheetActions>
    </form>
  )
}
