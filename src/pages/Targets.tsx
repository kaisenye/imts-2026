import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { DEFAULT_FILTERS, activeFilterCount, filterCompanies, type Filters } from '../lib/filter'
import { hallForBooths, hallName } from '../lib/hall'
import { websiteHref, websiteLabel } from '../lib/website'
import { TIER_NAMES, TIER_ORDER, TIER_SUBS, type Tier } from '../lib/types'
import { CompanyRow } from '../components/company/CompanyRow'
import { CompanyCard } from '../components/company/CompanyCard'
import { FilterSheet } from '../components/company/FilterSheet'
import { CompanyForm } from '../components/company/CompanyForm'
import { Panel } from '../components/ui/Panel'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { Empty } from '../components/ui/Empty'

export default function Targets() {
  const { companies, loading, error, reload, create } = useCompanies()
  const { visited, toggle } = useVisits()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const types = useMemo(
    () =>
      Array.from(
        new Set(companies.map((c) => c.company_type).filter((t): t is string => Boolean(t))),
      ).sort(),
    [companies],
  )

  const visible = useMemo(
    () => filterCompanies(companies, filters, visited),
    [companies, filters, visited],
  )

  const grouped = useMemo(() => {
    const map = new Map<Tier, typeof visible>()
    for (const tier of TIER_ORDER) {
      const rows = visible.filter((c) => c.tier === tier)
      if (rows.length) map.set(tier, rows)
    }
    return map
  }, [visible])

  const filterCount = activeFilterCount(filters)
  const visitedCount = Object.values(visited).filter(Boolean).length
  const selected = companies.find((c) => c.id === openId) ?? null
  const filtersDirty = filterCount > 0 || filters.q.trim().length > 0

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-7 lg:pr-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">
            Hit list
          </p>
          <h1 className="font-display mt-0.5 text-[34px] leading-none tracking-[-0.02em]">
            Targets
          </h1>
        </div>
        <Button onClick={() => setAddOpen(true)} className="mb-1 min-h-10 px-3 text-[14px]">
          Add
        </Button>
      </header>

      {/* Progress reads at a glance: how much of the floor is actually done. */}
      <div className="mt-5 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
            style={{ width: companies.length ? `${(visitedCount / companies.length) * 100}%` : '0%' }}
          />
        </div>
        <span className="tnum shrink-0 text-[12px] text-[var(--muted)]">
          {visitedCount}/{companies.length} visited
        </span>
      </div>

      <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-[var(--line)] bg-[var(--bg)]/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--faint)]"
            >
              <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Company, booth, keyword"
              aria-label="Search targets"
              className="
                min-h-11 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--raised)]
                pl-9 pr-3 text-base transition-colors duration-150
                placeholder:text-[var(--faint)] focus:border-[var(--accent)]
              "
            />
          </div>
          <Button
            onClick={() => setFiltersOpen(true)}
            className={`shrink-0 px-3 text-[14px] ${
              filterCount ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-ink)]' : ''
            }`}
          >
            Filters{filterCount ? ` · ${filterCount}` : ''}
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[12.5px] text-[var(--muted)]">
          <span className="tnum">{visible.length} shown</span>
          {filtersDirty && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[var(--accent-ink)] underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} onRetry={reload} />
        </div>
      )}
      {loading && <Empty>Loading targets…</Empty>}
      {!loading && !error && visible.length === 0 && (
        <Empty>Nothing matches those filters.</Empty>
      )}

      {Array.from(grouped.entries()).map(([tier, rows]) => (
        <section key={tier} className="mt-7">
          <div className="flex items-baseline gap-2 border-b-2 border-[var(--ink)] pb-1.5">
            <h2 className="font-display text-[19px] leading-tight">{TIER_NAMES[tier]}</h2>
            <span className="hidden text-[12px] text-[var(--muted)] sm:inline">
              {TIER_SUBS[tier]}
            </span>
            <span className="tnum ml-auto text-[12px] text-[var(--faint)]">{rows.length}</span>
          </div>
          <ul className="stagger list-none p-0">
            {rows.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                visited={!!visited[company.id]}
                selected={openId === company.id}
                onOpen={() => setOpenId(company.id)}
                onToggleVisited={() => void toggle(company.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      <Panel
        open={!!selected}
        title={selected?.name ?? ''}
        subtitle={
          selected && (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="tnum font-medium text-[var(--accent-ink)]">
                {selected.booths.join('  ')}
              </span>
              <span className="uppercase tracking-[0.08em] text-[var(--faint)]">
                {hallName(hallForBooths(selected.booths))}
              </span>
              {selected.hq && <span>· {selected.hq}</span>}
              {websiteHref(selected.website) && (
                <a
                  href={websiteHref(selected.website)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent-ink)] underline underline-offset-2 hover:text-[var(--accent)]"
                >
                  {websiteLabel(selected.website)}
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
        onClose={() => setOpenId(null)}
        footer={
          selected && (
            <div className="flex items-center gap-3">
              <label className="flex flex-1 items-center gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  checked={!!visited[selected.id]}
                  onChange={() => void toggle(selected.id)}
                  className="h-[18px] w-[18px] accent-[var(--accent)]"
                />
                Visited
              </label>
              <Link
                to={`/company/${selected.id}`}
                className="
                  flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-[14px]
                  font-medium text-white transition-opacity duration-150 hover:opacity-90
                "
              >
                Notes &amp; contacts
              </Link>
            </div>
          )
        }
      >
        {selected && <CompanyCard company={selected} />}
      </Panel>

      <FilterSheet
        open={filtersOpen}
        filters={filters}
        types={types}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
      />
      <Sheet open={addOpen} title="Add company" onClose={() => setAddOpen(false)}>
        <CompanyForm
          onSubmit={async (input) => {
            await create(input)
            setAddOpen(false)
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Sheet>
    </div>
  )
}
