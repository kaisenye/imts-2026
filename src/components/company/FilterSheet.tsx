import { HALL_NAMES, type Hall } from '../../lib/hall'
import type { Filters, StatusFilter } from '../../lib/filter'
import { TIER_LABELS, TIER_ORDER, type Tier } from '../../lib/types'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'

interface Props {
  open: boolean
  filters: Filters
  types: string[]
  onChange: (filters: Filters) => void
  onClose: () => void
}

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Not visited' },
  { value: 'visited', label: 'Visited' },
  { value: 'archived', label: 'Archived' },
]

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
      <div className="mb-2 text-[13px] text-[var(--muted)]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`min-h-10 rounded-full border px-3 text-[14px] ${
              value === option.value
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                : 'border-[var(--line)] text-[var(--muted)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterSheet({ open, filters, types, onChange, onClose }: Props) {
  return (
    <Sheet open={open} title="Filters" onClose={onClose}>
      <Group<Tier | 'all'>
        label="Tier"
        value={filters.tier}
        options={[
          { value: 'all' as const, label: 'All' },
          ...TIER_ORDER.map((t) => ({ value: t, label: TIER_LABELS[t] })),
        ]}
        onSelect={(tier) => onChange({ ...filters, tier })}
      />
      <Group<Hall | 'all'>
        label="Hall"
        value={filters.hall}
        options={[
          { value: 'all' as const, label: 'All' },
          ...(Object.keys(HALL_NAMES) as Hall[]).map((h) => ({ value: h, label: HALL_NAMES[h] })),
        ]}
        onSelect={(hall) => onChange({ ...filters, hall })}
      />
      <Group<string>
        label="Type"
        value={filters.type}
        options={[{ value: 'all', label: 'All' }, ...types.map((t) => ({ value: t, label: t }))]}
        onSelect={(type) => onChange({ ...filters, type })}
      />
      <Group<StatusFilter>
        label="Status"
        value={filters.status}
        options={STATUSES}
        onSelect={(status) => onChange({ ...filters, status })}
      />
      <Button variant="primary" className="w-full" onClick={onClose}>
        Show results
      </Button>
    </Sheet>
  )
}
