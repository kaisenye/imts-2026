import { Link } from 'react-router-dom'
import { hallForBooths, hallName } from '../../lib/hall'
import { websiteHref, websiteLabel } from '../../lib/website'
import type { Company } from '../../lib/types'
import { Panel } from '../ui/Panel'
import { CompanyCard } from './CompanyCard'

interface Props {
  company: Company | null
  visited: boolean
  onToggleVisited: () => void
  onClose: () => void
}

/**
 * The one company detail surface, shared by the targets list and the map.
 * Both entry points show the same thing: standing in front of a booth is
 * exactly when the opening line and the watch-out matter most, so the map
 * must not get a cut-down version.
 */
export function CompanyPanel({ company, visited, onToggleVisited, onClose }: Props) {
  const href = websiteHref(company?.website ?? null)

  return (
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
            <Link
              to={`/company/${company.id}`}
              className="
                flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-[14px]
                font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-ink)]
              "
            >
              Notes &amp; contacts
            </Link>
          </div>
        )
      }
    >
      {company && <CompanyCard company={company} />}
    </Panel>
  )
}
