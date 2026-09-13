import { useMemo, useState } from 'react'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { DEFAULT_FILTERS, activeFilterCount, filterCompanies, type Filters } from '../lib/filter'
import { TIER_NAMES, TIER_ORDER, TIER_SUBS, type Tier } from '../lib/types'
import { CompanyRow } from '../components/company/CompanyRow'
import { FilterSheet } from '../components/company/FilterSheet'
import { CompanyForm } from '../components/company/CompanyForm'
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
      Array.from(new Set(companies.map((c) => c.company_type).filter((t): t is string => Boolean(t)))).sort(),
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

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Targets</h1>
        <Button onClick={() => setAddOpen(true)} className="min-h-10 px-3 text-[14px]">
          + Add
        </Button>
      </div>

      <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-[var(--line)] bg-[var(--bg)] px-4 pb-3 pt-2">
        <div className="flex gap-2">
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search company, booth, keyword"
            aria-label="Search targets"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base"
          />
          <Button onClick={() => setFiltersOpen(true)} className="shrink-0 px-3 text-[14px]">
            Filters{filterCount ? ` (${filterCount})` : ''}
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[13px] text-[var(--muted)]">
          <span>
            {visible.length} shown · {Object.values(visited).filter(Boolean).length} visited
          </span>
          {(filterCount > 0 || filters.q) && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[var(--color-accent-ink)] underline"
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
      {!loading && visible.length === 0 && <Empty>Nothing matches those filters.</Empty>}

      {Array.from(grouped.entries()).map(([tier, rows]) => (
        <section key={tier} className="mt-6">
          <div className="flex items-baseline gap-2 border-b border-[var(--ink)] pb-1.5">
            <h2 className="text-[17px] font-semibold">{TIER_NAMES[tier]}</h2>
            <span className="text-[13px] text-[var(--muted)]">{TIER_SUBS[tier]}</span>
            <span className="ml-auto text-[13px] text-[var(--faint)]">{rows.length}</span>
          </div>
          <ul className="list-none p-0">
            {rows.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                visited={!!visited[company.id]}
                open={openId === company.id}
                onToggleOpen={() => setOpenId(openId === company.id ? null : company.id)}
                onToggleVisited={() => void toggle(company.id)}
              />
            ))}
          </ul>
        </section>
      ))}

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
