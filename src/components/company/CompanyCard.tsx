import { Link } from 'react-router-dom'
import type { Company } from '../../lib/types'

export function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="pb-4 pl-8 text-[15px]">
      {(company.company_type || company.hq) && (
        <p className="mb-2 text-[13px] text-[var(--muted)]">
          {[company.company_type, company.hq].filter(Boolean).join(' · ')}
        </p>
      )}
      {company.bio && <p className="my-1 text-[var(--muted)]">{company.bio}</p>}

      {company.fit && (
        <>
          <h4 className="mt-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-accent-ink)]">
            Why them
          </h4>
          <p className="my-1">{company.fit}</p>
        </>
      )}

      {company.opening_line && (
        <>
          <h4 className="mt-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-accent-ink)]">
            Opening line
          </h4>
          <p className="mt-1 border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2">
            {company.opening_line}
          </p>
        </>
      )}

      {company.asks && company.asks.length > 0 && (
        <>
          <h4 className="mt-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-accent-ink)]">
            Asks
          </h4>
          <ul className="mt-1 list-disc pl-5">
            {company.asks.map((ask) => (
              <li key={ask} className="my-1">
                {ask}
              </li>
            ))}
          </ul>
        </>
      )}

      {company.watch_out && (
        <p className="mt-3 border-l-2 border-[#b3372e] py-1 pl-3">{company.watch_out}</p>
      )}

      {company.who && <p className="mt-3 text-[14px] text-[var(--color-accent-ink)]">{company.who}</p>}

      <Link
        to={`/company/${company.id}`}
        className="mt-4 inline-block text-[14px] font-medium text-[var(--color-accent-ink)] underline"
      >
        Notes &amp; contacts →
      </Link>
    </div>
  )
}
