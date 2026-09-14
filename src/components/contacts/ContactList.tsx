import { useState } from 'react'
import type { Contact } from '../../lib/types'
import { useLocale } from '../../i18n/LocaleContext'
import { Lightbox } from '../ui/Lightbox'

export function ContactList({
  contacts,
  onRemove,
}: {
  contacts: Contact[]
  onRemove: (id: string) => void
}) {
  const { t } = useLocale()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (contacts.length === 0) {
    return <p className="py-4 text-[15px] text-[var(--muted)]">{t.noContacts}</p>
  }
  return (
    <>
      <ul className="mt-2 list-none p-0">
        {contacts.map((contact) => (
          <li key={contact.id} className="flex gap-3 border-b border-[var(--line)] py-3">
            {contact.card_image_url && (
              <button
                type="button"
                onClick={() => setExpanded(contact.card_image_url)}
                aria-label={`${t.viewCard}: ${contact.name || t.unnamed}`}
                className="group shrink-0 self-start"
              >
                <img
                  src={contact.card_image_url}
                  alt=""
                  className="h-14 w-20 rounded border border-[var(--line)] object-cover transition-[transform,border-color] duration-150 group-hover:scale-[1.03] group-hover:border-[var(--muted)]"
                />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">{contact.name || t.unnamed}</div>
              {(contact.title || contact.company_name) && (
                <div className="text-[13px] text-[var(--muted)]">
                  {[contact.title, contact.company_name].filter(Boolean).join(' · ')}
                </div>
              )}
              {[contact.email, contact.email2].filter(Boolean).map((email) => (
                <a key={email} href={`mailto:${email}`} className="block text-[14px] text-[var(--accent-ink)]">
                  {email}
                </a>
              ))}
              {[contact.phone, contact.phone2].filter(Boolean).map((phone) => (
                <a key={phone} href={`tel:${phone}`} className="block text-[14px] text-[var(--accent-ink)]">
                  {phone}
                </a>
              ))}
              {contact.notes && <p className="mt-1 text-[14px]">{contact.notes}</p>}
            </div>
            <button
              onClick={() => onRemove(contact.id)}
              className="shrink-0 self-start text-[13px] text-[var(--faint)] underline"
            >
              {t.del}
            </button>
          </li>
        ))}
      </ul>

      <Lightbox src={expanded} alt={t.viewCard} onClose={() => setExpanded(null)} />
    </>
  )
}
