import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { HALL_NAMES, hallForBooths, type Hall } from '../lib/hall'
import { FloorMap } from '../components/map/FloorMap'
import { PanZoom } from '../components/map/PanZoom'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'

export default function MapPage() {
  const { companies } = useCompanies()
  const { visited, toggle } = useVisits()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hallFilter, setHallFilter] = useState<Hall | null>(null)

  const active = companies.filter((c) => !c.archived)
  const selected = active.find((c) => c.id === selectedId) ?? null

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="text-2xl font-semibold">Map</h1>
      <p className="mt-1 text-[14px] text-[var(--muted)]">
        Tap a hall to filter, tap a pin for the ask. Pin positions come from booth numbering, so they are
        relative, not surveyed. Confirm on the{' '}
        <a
          href="https://directory.imts.com/8_0/explore/floorplan.cfm"
          rel="noopener"
          className="text-[var(--color-accent-ink)] underline"
        >
          official floor plan
        </a>{' '}
        before you walk.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() => setHallFilter(null)}
          className={`min-h-10 px-3 text-[14px] ${hallFilter === null ? 'border-[var(--color-accent)] text-[var(--color-accent-ink)]' : ''}`}
        >
          All halls
        </Button>
        {(Object.keys(HALL_NAMES) as Hall[]).map((hall) => (
          <Button
            key={hall}
            onClick={() => setHallFilter(hallFilter === hall ? null : hall)}
            className={`min-h-10 px-3 text-[14px] ${hallFilter === hall ? 'border-[var(--color-accent)] text-[var(--color-accent-ink)]' : ''}`}
          >
            {HALL_NAMES[hall]}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        <PanZoom>
          <FloorMap
            companies={active}
            visited={visited}
            selectedId={selectedId}
            hallFilter={hallFilter}
            onSelect={setSelectedId}
            onSelectHall={setHallFilter}
          />
        </PanZoom>
      </div>

      <ul className="mt-4 list-none border-t border-[var(--line)] p-0">
        {active
          .filter((c) => !hallFilter || hallForBooths(c.booths) === hallFilter)
          .map((company) => (
            <li
              key={company.id}
              onClick={() => setSelectedId(company.id)}
              className="flex cursor-pointer items-baseline gap-3 border-b border-[var(--line)] py-2.5 text-[14px]"
            >
              <span className="min-w-16 font-semibold">{company.booths[0]}</span>
              <span className={`flex-1 ${visited[company.id] ? 'text-[var(--muted)] line-through' : ''}`}>
                {company.name}
              </span>
            </li>
          ))}
      </ul>

      <Sheet open={!!selected} title={selected?.name ?? ''} onClose={() => setSelectedId(null)}>
        {selected && (
          <div className="text-[15px]">
            <p className="text-[var(--muted)]">
              {selected.booths.join(' · ')} · {HALL_NAMES[hallForBooths(selected.booths) ?? 'W']}
            </p>
            {selected.ask && <p className="mt-3">{selected.ask}</p>}
            <label className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!visited[selected.id]}
                onChange={() => void toggle(selected.id)}
                className="h-5 w-5 accent-[var(--color-accent)]"
              />
              Visited
            </label>
            <Link
              to={`/company/${selected.id}`}
              className="mt-4 inline-block text-[14px] font-medium text-[var(--color-accent-ink)] underline"
            >
              Notes &amp; contacts →
            </Link>
          </div>
        )}
      </Sheet>
    </div>
  )
}
