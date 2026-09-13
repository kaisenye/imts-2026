import { hallForBooths, type Hall } from './hall'
import type { Company, Tier } from './types'

export type StatusFilter = 'all' | 'visited' | 'todo' | 'archived'

export interface Filters {
  q: string
  tier: Tier | 'all'
  type: string | 'all'
  hall: Hall | 'all'
  status: StatusFilter
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  tier: 'all',
  type: 'all',
  hall: 'all',
  status: 'all',
}

function matchesQuery(company: Company, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    company.name,
    company.ask,
    company.company_type,
    company.hq,
    company.who,
    company.bio,
    ...company.booths,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

export function filterCompanies(
  companies: Company[],
  filters: Filters,
  visited: Record<string, boolean>,
): Company[] {
  return companies.filter((company) => {
    if (filters.status === 'archived') {
      if (!company.archived) return false
    } else if (company.archived) {
      return false
    }

    if (!matchesQuery(company, filters.q)) return false
    if (filters.tier !== 'all' && company.tier !== filters.tier) return false
    if (filters.type !== 'all' && company.company_type !== filters.type) return false

    if (filters.hall !== 'all' && hallForBooths(company.booths) !== filters.hall) return false

    if (filters.status === 'visited' && !visited[company.id]) return false
    if (filters.status === 'todo' && visited[company.id]) return false

    return true
  })
}

export function activeFilterCount(filters: Filters): number {
  let count = 0
  if (filters.tier !== 'all') count++
  if (filters.type !== 'all') count++
  if (filters.hall !== 'all') count++
  if (filters.status !== 'all') count++
  return count
}
