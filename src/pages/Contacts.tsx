import { useMemo, useState } from 'react'
import { useContacts } from '../hooks/useContacts'
import { useLocale } from '../i18n/LocaleContext'
import { useCompanies } from '../hooks/useCompanies'
import { contactsToCsv, downloadCsv } from '../lib/csv'
import { ContactList } from '../components/contacts/ContactList'
import { CardCapture } from '../components/contacts/CardCapture'
import { Button } from '../components/ui/Button'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { Empty } from '../components/ui/Empty'

export default function Contacts() {
  const { t } = useLocale()
  const { contacts, loading, error, reload, add, remove } = useContacts()
  const { companies } = useCompanies()
  const [q, setQ] = useState('')
  const [captureOpen, setCaptureOpen] = useState(false)

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return contacts
    return contacts.filter((contact) =>
      [contact.name, contact.title, contact.company_name, contact.email, contact.phone, contact.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [contacts, q])

  const companyName = (id: string | null) =>
    id ? (companies.find((c) => c.id === id)?.name ?? null) : null

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{t.contactsTitle}</h1>
        <Button onClick={() => setCaptureOpen(true)} variant="primary" className="min-h-10 px-3 text-[14px]">
          {t.addCard}
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchContacts}
          aria-label={t.searchContacts}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base"
        />
        <Button
          onClick={() => downloadCsv('imts-2026-contacts.csv', contactsToCsv(contacts))}
          disabled={contacts.length === 0}
          className="shrink-0 px-3 text-[14px]"
        >
          {t.csv}
        </Button>
      </div>

      <p className="mt-2 text-[13px] text-[var(--muted)]">
        {visible.length} of {contacts.length}
      </p>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} onRetry={reload} />
        </div>
      )}
      {loading && <Empty>{t.loadingTargets}</Empty>}
      {!loading && contacts.length === 0 && <Empty>{t.noCards}</Empty>}
      {!loading && contacts.length > 0 && visible.length === 0 && (
        <Empty>{t.noContactMatch} “{q.trim()}”</Empty>
      )}

      {visible.length > 0 && (
        <ContactList
          contacts={visible.map((c) => ({
            ...c,
            company_name: c.company_name ?? companyName(c.company_id),
          }))}
          onRemove={(id) => void remove(id)}
        />
      )}

      <CardCapture
        open={captureOpen}
        companyId={null}
        companies={companies}
        onSave={async (input) => {
          await add(input)
          setCaptureOpen(false)
        }}
        onClose={() => setCaptureOpen(false)}
      />
    </div>
  )
}
