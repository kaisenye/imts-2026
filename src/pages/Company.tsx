import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { useNotes } from '../hooks/useNotes'
import { useContacts } from '../hooks/useContacts'
import { hallForBooths, hallName } from '../lib/hall'
import { CompanyCard } from '../components/company/CompanyCard'
import { CompanyForm } from '../components/company/CompanyForm'
import { NoteComposer } from '../components/notes/NoteComposer'
import { NoteList } from '../components/notes/NoteList'
import { ContactList } from '../components/contacts/ContactList'
import { CardCapture } from '../components/contacts/CardCapture'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { ErrorBanner } from '../components/ui/ErrorBanner'

export default function Company() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { companies, loading, error, reload, update, remove } = useCompanies()
  const { visited, toggle } = useVisits()
  const { notes, add: addNote, remove: removeNote } = useNotes(id)
  const { contacts, add: addContact, remove: removeContact } = useContacts(id)
  const [editOpen, setEditOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)

  const company = companies.find((c) => c.id === id)

  if (loading) return <Empty>Loading…</Empty>
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <ErrorBanner message={error} onRetry={reload} />
      </div>
    )
  }
  if (!company) return <Empty>Company not found.</Empty>

  const onDelete = async () => {
    const label = company.is_default
      ? `Archive ${company.name}? Its notes and contacts are kept.`
      : `Delete ${company.name} and all its notes? This cannot be undone.`
    if (!confirm(label)) return
    await remove(company)
    navigate('/targets')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <Link to="/targets" className="text-[14px] text-[var(--muted)]">
        ← Targets
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <p className="mt-1 text-[14px] text-[var(--muted)]">
            {company.booths.join(' · ')} · {hallName(hallForBooths(company.booths))}
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={!!visited[company.id]}
            onChange={() => void toggle(company.id)}
            className="h-5 w-5 accent-[var(--accent)]"
          />
          Visited
        </label>
      </div>

      {company.archived && (
        <p className="mt-3 rounded-lg bg-[var(--surface)] p-3 text-[14px] text-[var(--muted)]">
          Archived.{' '}
          <button
            onClick={() => void update(company.id, { archived: false })}
            className="text-[var(--accent-ink)] underline"
          >
            Restore
          </button>
        </p>
      )}

      <div className="mt-4">
        <CompanyCard company={company} />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setEditOpen(true)} className="flex-1">
          Edit
        </Button>
        <Button variant="danger" onClick={() => void onDelete()} className="flex-1">
          {company.is_default ? 'Archive' : 'Delete'}
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="border-b border-[var(--ink)] pb-1.5 text-[17px] font-semibold">Notes</h2>
        <NoteComposer onAdd={addNote} />
        <NoteList notes={notes} onRemove={(noteId) => void removeNote(noteId)} />
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b border-[var(--ink)] pb-1.5">
          <h2 className="text-[17px] font-semibold">Contacts</h2>
          <Button onClick={() => setCaptureOpen(true)} variant="primary" className="min-h-10 px-3 text-[14px]">
            + Card
          </Button>
        </div>
        <ContactList contacts={contacts} onRemove={(contactId) => void removeContact(contactId)} />
      </section>

      <Sheet open={editOpen} title="Edit company" onClose={() => setEditOpen(false)}>
        <CompanyForm
          initial={company}
          onSubmit={async (patch) => {
            await update(company.id, patch)
            setEditOpen(false)
          }}
          onCancel={() => setEditOpen(false)}
        />
      </Sheet>

      <CardCapture
        open={captureOpen}
        companyId={company.id}
        defaultCompanyName={company.name}
        onSave={async (input) => {
          await addContact(input)
          setCaptureOpen(false)
        }}
        onClose={() => setCaptureOpen(false)}
      />
    </div>
  )
}
