import { HALL_NAMES, type Hall } from '../../lib/hall'
import type { Filters, StatusFilter } from '../../lib/filter'
import { TIER_ORDER, type Tier } from '../../lib/types'
import { Sheet, SheetActions, SheetBody } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { useLocale } from '../../i18n/LocaleContext'
import { localHallName, tierLabel } from '../../i18n/company'

interface Props {
  open: boolean
  filters: Filters
  types: string[]
  onChange: (filters: Filters) => void
  onClose: () => void
}

function Group<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onSelect: (value: T) => void
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.07em] text-[var(--muted)]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            aria-pressed={value === option.value}
            className={`
              min-h-10 rounded-full border px-3.5 text-[14px] font-medium
              transition-colors duration-150
              ${
                value === option.value
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-ink)]'
                  : 'border-[var(--line-strong)] bg-[var(--raised)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterSheet({ open, filters, types, onChange, onClose }: Props) {
  const { t } = useLocale()
  const all = { value: 'all' as const, label: t.filterAll }

  const statuses: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t.filterAll },
    { value: 'todo', label: t.statusTodo },
    { value: 'visited', label: t.statusVisited },
    { value: 'archived', label: t.statusArchived },
  ]

  return (
    <Sheet open={open} title={t.filters} onClose={onClose}>
      <SheetBody>
        <Group<Tier | 'all'>
          label={t.filterTier}
          value={filters.tier}
          options={[all, ...TIER_ORDER.map((tier) => ({ value: tier, label: tierLabel(tier, t) }))]}
          onSelect={(tier) => onChange({ ...filters, tier })}
        />
        <Group<Hall | 'all'>
          label={t.filterHall}
          value={filters.hall}
          options={[
            all,
            ...(Object.keys(HALL_NAMES) as Hall[]).map((h) => ({ value: h, label: localHallName(h, t) })),
          ]}
          onSelect={(hall) => onChange({ ...filters, hall })}
        />
        <Group<string>
          label={t.filterType}
          value={filters.type}
          options={[all, ...types.map((type) => ({ value: type, label: type }))]}
          onSelect={(type) => onChange({ ...filters, type })}
        />
        <Group<StatusFilter>
          label={t.filterStatus}
          value={filters.status}
          options={statuses}
          onSelect={(status) => onChange({ ...filters, status })}
        />
      </SheetBody>
      <SheetActions>
        <Button variant="primary" className="w-full" onClick={onClose}>
          {t.showResults}
        </Button>
      </SheetActions>
    </Sheet>
  )
}
