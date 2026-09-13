import { describe, it, expect } from 'vitest'
import { filterCompanies, type Filters, DEFAULT_FILTERS } from '../src/lib/filter'
import type { Company } from '../src/lib/types'

const make = (over: Partial<Company>): Company => ({
  id: 'x',
  name: 'X',
  tier: 'A',
  booths: ['432000'],
  company_type: 'Importer',
  hq: null,
  ask: null,
  who: null,
  bio: null,
  fit: null,
  opening_line: null,
  asks: null,
  watch_out: null,
  is_default: true,
  archived: false,
  created_at: '2026-01-01T00:00:00Z',
  ...over,
})

const yamazen = make({ id: 'yamazen', name: 'Yamazen', tier: 'A', booths: ['338536'], company_type: 'Importer', ask: 'Brother SPEEDIO is a BT30 world' })
const haimer = make({ id: 'haimer', name: 'HAIMER USA', tier: 'C', booths: ['431510'], company_type: 'Competitor' })
const gone = make({ id: 'gone', name: 'Archived Co', archived: true })
const all = [yamazen, haimer, gone]
const visited = { yamazen: true }

describe('filterCompanies', () => {
  it('hides archived companies by default', () => {
    const result = filterCompanies(all, DEFAULT_FILTERS, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen', 'haimer'])
  })

  it('shows only archived when status is archived', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, status: 'archived' }, visited)
    expect(result.map((c) => c.id)).toEqual(['gone'])
  })

  it('matches the query against name', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, q: 'haim' }, visited)
    expect(result.map((c) => c.id)).toEqual(['haimer'])
  })

  it('matches the query against booth number', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, q: '338536' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })

  it('matches the query against the ask text', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, q: 'speedio' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })

  it('filters by tier', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, tier: 'C' }, visited)
    expect(result.map((c) => c.id)).toEqual(['haimer'])
  })

  it('filters by company type', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, type: 'Importer' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })

  it('filters by hall derived from booth', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, hall: 'W' }, visited)
    expect(result.map((c) => c.id)).toEqual(['haimer'])
  })

  it('filters by visited status', () => {
    expect(filterCompanies(all, { ...DEFAULT_FILTERS, status: 'visited' }, visited).map((c) => c.id)).toEqual(['yamazen'])
    expect(filterCompanies(all, { ...DEFAULT_FILTERS, status: 'todo' }, visited).map((c) => c.id)).toEqual(['haimer'])
  })

  it('combines filters', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, tier: 'A', status: 'visited' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })
})
