import { useEffect, useState } from 'react'
import { hallForBooths, hallName } from '../../lib/hall'
import { websiteHref, websiteLabel } from '../../lib/website'
import { useNotes } from '../../hooks/useNotes'
import { useContacts } from '../../hooks/useContacts'
import type { Company } from '../../lib/types'
import { Panel } from '../ui/Panel'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { CompanyCard } from './CompanyCard'
import { CompanyForm } from './CompanyForm'
import { NoteComposer } from '../notes/NoteComposer'
import { NoteList } from '../notes/NoteList'
import { ContactList } from '../contacts/ContactList'
import { CardCapture } from '../contacts/CardCapture'

type Tab = 'brief' | 'notes' | 'contacts'

interface Props {
  company: Company | null
  visited: boolean
  onToggleVisited: () => void
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Company>) => Promise<unknown>
  onRemove: (company: Company) => Promise<void>
}

/**
 * The whole company record in one surface — brief, notes and contacts — so
 * nothing needs a separate page. Tabs rather than one long scroll: on a phone
 * you are usually here for one of the three, and hunting for the note box past
 * a full sales profile is the wrong trade.
 */
export function CompanyPanel({
  company,
  visited,
  onToggleVisited,
  onClose,
  onUpdate,
  onRemove,
}: Props) {
  const [tab, setTab] = useState<Tab>('brief')
  const [editOpen, setEditOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)

  const id = company?.id
  const { notes, add: addNote, remove: removeNote } = useNotes(id)
  const { contacts, add: addContact, remove: removeContact } = useContacts(id)

  // A different company always opens on the brief.
  useEffect(() => {
    setTab('brief')
  }, [id])

  const href = websiteHref(company?.website ?? null)

  const onDelete = async () => {
    if (!company) return
    const label = company.is_default
      ? `Archive ${company.name}? Its notes and contacts are kept.`
      : `Delete ${company.name} and all its notes? This cannot be undone.`
    if (!confirm(label)) return
    await onRemove(company)
    onClose()
  }

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'brief', label: 'Brief' },
    { key: 'notes', label: 'Notes', count: notes.length },
    { key: 'contacts', label: 'Contacts', count: contacts.length },
  ]

  return (
    <>
      <Panel
        open={!!company}
        title={company?.name ?? ''}
        subtitle={
          company && (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="tnum font-medium text-[var(--accent-ink)]">
                {company.booths.join('  ')}
              </span>
              <span className="uppercase tracking-[0.08em] text-[var(--faint)]">
                {hallName(hallForBooths(company.booths))}
              </span>
              {company.hq && <span>· {company.hq}</span>}
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent-ink)] underline underline-offset-2 hover:text-[var(--accent)]"
                >
                  {websiteLabel(company.website)}
                  <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
                    <path
                      d="M3 1h6v6M9 1L1.5 8.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
            </span>
          )
        }
        onClose={onClose}
        footer={
          company && (
            <div className="flex items-center gap-3">
              <label className="flex flex-1 items-center gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  checked={visited}
                  onChange={onToggleVisited}
                  className="h-[18px] w-[18px] accent-[var(--accent)]"
                />
                Visited
              </label>
              {tab === 'contacts' ? (
                <Button variant="primary" onClick={() => setCaptureOpen(true)} className="px-4">
                  Add contact
                </Button>
              ) : (
                <>
                  <Button onClick={() => setEditOpen(true)} className="px-3.5 text-[14px]">
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => void onDelete()} className="px-3.5 text-[14px]">
                    {company.is_default ? 'Archive' : 'Delete'}
                  </Button>
                </>
              )}
            </div>
          )
        }
      >
        {company && (
          <>
            {company.archived && (
              <p className="mb-4 rounded-lg bg-[var(--surface)] p-3 text-[13.5px] text-[var(--muted)]">
                Archived.{' '}
                <button
                  onClick={() => void onUpdate(company.id, { archived: false })}
                  className="text-[var(--accent-ink)] underline underline-offset-2"
                >
                  Restore
                </button>
              </p>
            )}

            <div
              role="tablist"
              className="mb-4 flex gap-1 rounded-lg bg-[var(--surface)] p-1"
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`
                    flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-2
                    text-[13.5px] font-medium transition-colors duration-150
                    ${
                      tab === t.key
                        ? 'bg-[var(--raised)] text-[var(--ink)] shadow-[0_1px_2px_rgb(22_25_26/0.08)]'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }
                  `}
                >
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className="tnum text-[11px] text-[var(--faint)]">{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {tab === 'brief' && <CompanyCard company={company} />}

            {tab === 'notes' && (
              <div>
                <NoteComposer onAdd={addNote} />
                <NoteList notes={notes} onRemove={(noteId) => void removeNote(noteId)} />
              </div>
            )}

            {tab === 'contacts' && (
              <ContactList contacts={contacts} onRemove={(cid) => void removeContact(cid)} />
            )}
          </>
        )}
      </Panel>

      {company && (
        <>
          <Sheet open={editOpen} title="Edit company" onClose={() => setEditOpen(false)}>
            <CompanyForm
              initial={company}
              onSubmit={async (patch) => {
                await onUpdate(company.id, patch)
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
        </>
      )}
    </>
  )
}
