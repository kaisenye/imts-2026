import type { Contact } from '../../lib/types'

export function ContactList({
  contacts,
  onRemove,
}: {
  contacts: Contact[]
  onRemove: (id: string) => void
}) {
  if (contacts.length === 0) {
    return <p className="py-4 text-[15px] text-[var(--muted)]">No contacts yet.</p>
  }
  return (
    <ul className="mt-2 list-none p-0">
      {contacts.map((contact) => (
        <li key={contact.id} className="flex gap-3 border-b border-[var(--line)] py-3">
          {contact.card_image_url && (
            <img
              src={contact.card_image_url}
              alt=""
              className="h-14 w-20 shrink-0 rounded border border-[var(--line)] object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold">{contact.name || 'Unnamed'}</div>
            {(contact.title || contact.company_name) && (
              <div className="text-[13px] text-[var(--muted)]">
                {[contact.title, contact.company_name].filter(Boolean).join(' · ')}
              </div>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="block text-[14px] text-[var(--color-accent-ink)]">
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="block text-[14px] text-[var(--color-accent-ink)]">
                {contact.phone}
              </a>
            )}
            {contact.notes && <p className="mt-1 text-[14px]">{contact.notes}</p>}
          </div>
          <button
            onClick={() => onRemove(contact.id)}
            className="shrink-0 self-start text-[13px] text-[var(--faint)] underline"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
