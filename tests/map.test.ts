import { describe, it, expect } from 'vitest'
import { layoutPins, HALL_RECTS } from '../src/content/map'
import type { Hall } from '../src/lib/hall'

// Booths that share an aisle prefix seed to nearly identical coordinates.
// Without collision resolution the real 88-company list produced 119
// overlapping pairs, some 2px apart — untappable on a phone.
const crowded = [
  { id: 'yamazen', booth: '338536' },
  { id: 'makino', booth: '338519' },
  { id: 'absolute', booth: '339476' },
  { id: 'methods', booth: '339033' },
  { id: 'productivity', booth: '338100' },
  { id: 'expand', booth: '338045' },
  { id: 'hermle', booth: '339121' },
  { id: 'index', booth: '339119' },
]

function closestPair(pins: { x: number; y: number }[]): number {
  let min = Infinity
  for (let i = 0; i < pins.length; i++) {
    for (let j = i + 1; j < pins.length; j++) {
      min = Math.min(min, Math.hypot(pins[i].x - pins[j].x, pins[i].y - pins[j].y))
    }
  }
  return min
}

describe('layoutPins', () => {
  it('returns one position per input, in order', () => {
    const out = layoutPins(crowded, 'S')
    expect(out).toHaveLength(crowded.length)
    expect(out.map((p) => p.id)).toEqual(crowded.map((p) => p.id))
  })

  it('separates booths that share an aisle prefix', () => {
    const out = layoutPins(crowded, 'S')
    expect(closestPair(out)).toBeGreaterThanOrEqual(12)
  })

  it('keeps every pin inside its hall rectangle', () => {
    for (const hall of ['W', 'N', 'S', 'E'] as Hall[]) {
      const rect = HALL_RECTS[hall]
      for (const pin of layoutPins(crowded, hall)) {
        expect(pin.x).toBeGreaterThanOrEqual(rect.x)
        expect(pin.x).toBeLessThanOrEqual(rect.x + rect.w)
        expect(pin.y).toBeGreaterThanOrEqual(rect.y)
        expect(pin.y).toBeLessThanOrEqual(rect.y + rect.h)
      }
    }
  })

  it('is deterministic across runs', () => {
    expect(layoutPins(crowded, 'W')).toEqual(layoutPins(crowded, 'W'))
  })

  it('handles a single pin and an empty list', () => {
    expect(layoutPins([], 'W')).toEqual([])
    expect(layoutPins([{ id: 'solo', booth: '432228' }], 'W')).toHaveLength(1)
  })
})
