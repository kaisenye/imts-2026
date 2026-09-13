import type { Company } from '../../lib/types'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-ink)]">
      {children}
    </h4>
  )
}

export function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="text-[15px] leading-relaxed">
      {company.bio && <p className="text-[var(--muted)]">{company.bio}</p>}

      {company.fit && (
        <>
          <Label>Why them</Label>
          <p className="mt-1">{company.fit}</p>
        </>
      )}

      {company.opening_line && (
        <>
          <Label>Opening line</Label>
          {/* The one thing read verbatim while walking up to a booth, so it
              gets the strongest treatment on the page. */}
          <p className="mt-1.5 rounded-r border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-[16px] font-medium leading-snug">
            {company.opening_line}
          </p>
        </>
      )}

      {company.asks && company.asks.length > 0 && (
        <>
          <Label>Asks</Label>
          <ul className="mt-1.5 space-y-1.5">
            {company.asks.map((ask, i) => (
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

      {company.watch_out && (
        <>
          <Label>
            <span className="text-[var(--flag)]">Watch out</span>
          </Label>
          <p className="mt-1.5 rounded-r border-l-2 border-[var(--flag)] bg-[var(--flag-soft)] px-3.5 py-2.5 text-[14px]">
            {company.watch_out}
          </p>
        </>
      )}

      {company.who && (
        <>
          <Label>Named contacts</Label>
          <p className="mt-1 text-[14px]">{company.who}</p>
        </>
      )}
    </div>
  )
}
