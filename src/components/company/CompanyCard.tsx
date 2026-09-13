import type { Company } from '../../lib/types'
import { useLocale } from '../../i18n/LocaleContext'
import { localizeCompany } from '../../i18n/company'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-ink)]">
      {children}
    </h4>
  )
}

export function CompanyCard({ company }: { company: Company }) {
  const { locale, t } = useLocale()
  const c = localizeCompany(company, locale)

  return (
    <div className="text-[15px] leading-relaxed">
      {/* The one-line summary leads: it is the whole pitch when there is no
          time to read further, and for a company added by hand it may be the
          only thing filled in. */}
      {c.ask && <p className="font-medium">{c.ask}</p>}

      {c.bio && (
        <p className={`text-[var(--muted)] ${c.ask ? 'mt-2.5' : ''}`}>{c.bio}</p>
      )}

      {c.fit && (
        <>
          <Label>{t.whyThem}</Label>
          <p className="mt-1">{c.fit}</p>
        </>
      )}

      {c.opening_line && (
        <>
          <Label>{t.openingLine}</Label>
          {/* The one thing read verbatim while walking up to a booth, so it
              gets the strongest treatment on the page. */}
          <p className="mt-1.5 rounded-r border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-[16px] font-medium leading-snug">
            {c.opening_line}
          </p>
        </>
      )}

      {c.asks && c.asks.length > 0 && (
        <>
          <Label>{t.asks}</Label>
          <ul className="mt-1.5 space-y-1.5">
            {c.asks.map((ask, i) => (
              <li key={ask} className="flex gap-2.5">
                <span className="tnum mt-px shrink-0 text-[12px] text-[var(--faint)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{ask}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {c.watch_out && (
        <>
          <Label>
            <span className="text-[var(--flag)]">{t.watchOut}</span>
          </Label>
          <p className="mt-1.5 rounded-r border-l-2 border-[var(--flag)] bg-[var(--flag-soft)] px-3.5 py-2.5 text-[14px]">
            {c.watch_out}
          </p>
        </>
      )}

      {company.who && (
        <>
          <Label>{t.namedContacts}</Label>
          <p className="mt-1 text-[14px]">{company.who}</p>
        </>
      )}
    </div>
  )
}
