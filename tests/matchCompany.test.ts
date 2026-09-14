import { describe, it, expect } from 'vitest'
import { matchCompany } from '../src/lib/matchCompany'

// OCR reads a company name off a card as free text. A contact saved without
// a company_id never shows in that company's panel, so the free text has to
// resolve to a record — confidently, or not at all.
const companies = [
  { id: 'omega', name: 'Omega TMM', archived: false },
  { id: 'yamazen', name: 'Yamazen', archived: false },
  { id: 'haimer', name: 'HAIMER USA', archived: false },
  { id: 'ellison', name: 'Ellison Technologies (at DN Solutions)', archived: false },
  { id: 'kennametal', name: 'Kennametal', archived: false },
  { id: 'sandvik', name: 'Sandvik Coromant', archived: false },
  { id: 'big', name: 'BIG DAISHOWA', archived: false },
  { id: 'haas', name: 'Haas Automation', archived: false },
  { id: 'haastool', name: 'Haas Tooling', archived: false },
  { id: 'gone', name: 'Omega Legacy', archived: true },
]

describe('matchCompany', () => {
  it('matches an exact name', () => {
    expect(matchCompany('Omega TMM', companies)).toBe('omega')
  })

  it('ignores case, punctuation and legal suffixes', () => {
    expect(matchCompany('omega-tmm, inc.', companies)).toBe('omega')
    expect(matchCompany('Yamazen Inc.', companies)).toBe('yamazen')
    expect(matchCompany('Haimer', companies)).toBe('haimer')
  })

  it('ignores a parenthetical in the record name', () => {
    expect(matchCompany('Ellison Technologies', companies)).toBe('ellison')
  })

  it('matches when one name contains the other', () => {
    expect(matchCompany('Kennametal Inc', companies)).toBe('kennametal')
    expect(matchCompany('Sandvik', companies)).toBe('sandvik')
  })

  it('prefers an exact match over a containment match', () => {
    expect(matchCompany('Haas Tooling', companies)).toBe('haastool')
  })

  it('refuses to guess between equally good candidates', () => {
    expect(matchCompany('Haas', companies)).toBeNull()
  })

  it('refuses very short fragments', () => {
    expect(matchCompany('BIG', companies)).toBeNull()
  })

  it('never links to an archived company', () => {
    expect(matchCompany('Omega Legacy', companies)).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(matchCompany(null, companies)).toBeNull()
    expect(matchCompany('   ', companies)).toBeNull()
    expect(matchCompany('Nobody Corp', companies)).toBeNull()
  })
})
