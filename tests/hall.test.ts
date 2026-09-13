import { describe, it, expect } from 'vitest'
import { hallForBooth, hallForBooths, hallName, HALL_NAMES } from '../src/lib/hall'

describe('hallForBooth', () => {
  it('maps first digit to hall letter', () => {
    expect(hallForBooth('134506')).toBe('E')
    expect(hallForBooth('236744')).toBe('N')
    expect(hallForBooth('338536')).toBe('S')
    expect(hallForBooth('432228')).toBe('W')
  })

  it('returns null for unknown or malformed booths', () => {
    expect(hallForBooth('999999')).toBeNull()
    expect(hallForBooth('')).toBeNull()
    expect(hallForBooth('abc')).toBeNull()
  })
})

describe('hallForBooths', () => {
  it('uses the first booth in the list', () => {
    expect(hallForBooths(['338100', '432212'])).toBe('S')
  })

  it('falls back to the first booth that resolves', () => {
    expect(hallForBooths(['bogus', '432212'])).toBe('W')
  })

  it('returns null for an empty list', () => {
    expect(hallForBooths([])).toBeNull()
  })
})

describe('hallName', () => {
  it('gives the display name', () => {
    expect(hallName('W')).toBe('West')
    expect(hallName(null)).toBe('—')
  })

  it('exposes all four halls', () => {
    expect(Object.keys(HALL_NAMES).sort()).toEqual(['E', 'N', 'S', 'W'])
  })
})
