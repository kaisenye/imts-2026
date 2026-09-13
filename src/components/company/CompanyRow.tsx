import { hallForBooths, hallName } from '../../lib/hall'
import type { Company } from '../../lib/types'
import { CompanyCard } from './CompanyCard'

interface Props {
  company: Company
  visited: boolean
  open: boolean
  onToggleOpen: () => void
  onToggleVisited: () => void
}

export function CompanyRow({ company, visited, open, onToggleOpen, onToggleVisited }: Props) {
  return (
    <li className="border-b border-[var(--line)]">
      <div className="flex items-start gap-3 py-3">
        <input
          type="checkbox"
          checked={visited}
          onChange={onToggleVisited}
          aria-label={`Mark ${company.name} visited`}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
        />
        <button onClick={onToggleOpen} className="min-w-0 flex-1 text-left">
          <span
            className={`block text-[15px] font-semibold ${
              visited ? 'text-[var(--muted)] line-through' : ''
            }`}
          >
            {company.name}
          </span>
          <span className="mt-0.5 block text-[13px] text-[var(--muted)]">
            {company.booths.join(' · ')} · {hallName(hallForBooths(company.booths))}
          </span>
          {!open && company.ask && (
            <span className="mt-1 line-clamp-2 block text-[13px] text-[var(--muted)]">{company.ask}</span>
          )}
        </button>
        <span className="pt-1 text-[13px] text-[var(--faint)]">{open ? '−' : '+'}</span>
      </div>
      {open && <CompanyCard company={company} />}
    </li>
  )
}
