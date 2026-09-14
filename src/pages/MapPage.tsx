import { useState } from 'react'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { HALL_NAMES, hallForBooths, type Hall } from '../lib/hall'
import { useLocale } from '../i18n/LocaleContext'
import { localizeCompany, localHallName } from '../i18n/company'
import { CompanyPanel } from '../components/company/CompanyPanel'
import { FloorMap } from '../components/map/FloorMap'
import { PanZoom } from '../components/map/PanZoom'
import { Button } from '../components/ui/Button'

export default function MapPage() {
  const { locale, t } = useLocale()
  const { companies, update, remove } = useCompanies()
  const { visited, toggle } = useVisits()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hallFilter, setHallFilter] = useState<Hall | null>(null)

  const active = companies.filter((c) => !c.archived)
  const selected = active.find((c) => c.id === selectedId) ?? null

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="text-2xl font-semibold">{t.mapTitle}</h1>
      <p className="mt-1 text-[14px] text-[var(--muted)]">
        {t.mapNote}{' '}
        <a
          href="https://directory.imts.com/8_0/explore/floorplan.cfm"
          rel="noopener"
          className="text-[var(--accent-ink)] underline"
        >
          {t.officialPlan}
        </a>{' '}
        {t.beforeWalk}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() => setHallFilter(null)}
          selected={hallFilter === null}
          className="min-h-10 px-3 text-[14px]"
        >
          {t.allHalls}
        </Button>
        {(Object.keys(HALL_NAMES) as Hall[]).map((hall) => (
          <Button
            key={hall}
            onClick={() => setHallFilter(hallFilter === hall ? null : hall)}
            selected={hallFilter === hall}
            className="min-h-10 px-3 text-[14px]"
          >
            {localHallName(hall, t)}
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
              <span className="tnum min-w-16 font-semibold">{company.booths[0]}</span>
              <span className={`flex-1 ${visited[company.id] ? 'text-[var(--muted)] line-through' : ''}`}>
                {localizeCompany(company, locale).name}
              </span>
            </li>
          ))}
      </ul>

      <CompanyPanel
        company={selected}
        companies={companies}
        visited={!!selected && !!visited[selected.id]}
        onToggleVisited={() => selected && void toggle(selected.id)}
        onClose={() => setSelectedId(null)}
        onUpdate={update}
        onRemove={remove}
      />
    </div>
  )
}
