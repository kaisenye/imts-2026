import { hallForBooths } from '../../lib/hall'
import type { Company } from '../../lib/types'
import { useLocale } from '../../i18n/LocaleContext'
import { localizeCompany, localHallName } from '../../i18n/company'

interface Props {
  company: Company
  visited: boolean
  selected: boolean
  onOpen: () => void
  onToggleVisited: () => void
}

export function CompanyRow({ company, visited, selected, onOpen, onToggleVisited }: Props) {
  const { locale, t } = useLocale()
  const c = localizeCompany(company, locale)

  return (
    <li
      className={`
        animate-rise border-b border-[var(--line)] transition-colors duration-150
        ${selected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--surface)]'}
      `}
    >
      <div className="flex items-start gap-3 px-1 py-3">
        {/* Deliberately outside the row button: marking visited must never be
            a mis-tap on the way to opening the record. */}
        <label className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={visited}
            onChange={onToggleVisited}
            aria-label={`Mark ${c.name} visited`}
            className="h-[18px] w-[18px] accent-[var(--accent)]"
          />
        </label>

        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className="flex items-baseline gap-2">
            <span
              className={`
                truncate text-[15px] font-semibold leading-snug transition-colors duration-150
                ${visited ? 'text-[var(--faint)] line-through' : 'text-[var(--ink)]'}
              `}
            >
              {company.name}
            </span>
          </span>

          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="tnum text-[12.5px] font-medium text-[var(--accent-ink)]">
              {company.booths.join('  ')}
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--faint)]">
              {localHallName(hallForBooths(company.booths), t)}
            </span>
            {c.company_type && (
              <span className="rounded-full border border-[var(--line-strong)] px-1.5 py-px text-[11px] text-[var(--muted)]">
                {c.company_type}
              </span>
            )}
          </span>

          {c.ask && (
            <span className="mt-1.5 line-clamp-2 block text-[13px] leading-snug text-[var(--muted)]">
              {c.ask}
            </span>
          )}
        </button>

        <span
          aria-hidden="true"
          className="mt-1 shrink-0 text-[var(--faint)] transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <svg width="7" height="12" viewBox="0 0 7 12">
            <path
              d="M1 1l5 5-5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </li>
  )
}
