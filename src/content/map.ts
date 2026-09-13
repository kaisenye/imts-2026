import type { Hall } from '../lib/hall'

export interface HallRect {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub: string
}

export const VIEWBOX = { width: 800, height: 540 }

export const HALL_RECTS: Record<Hall, HallRect> = {
  W: { x: 40, y: 70, w: 260, h: 420, label: 'West · L3', sub: 'Tooling & Workholding · 9:00–17:00 · 43xxxx' },
  N: { x: 340, y: 70, w: 220, h: 170, label: 'North · L3', sub: 'Automation · 10:00–18:00 · 23xxxx' },
  S: { x: 340, y: 270, w: 220, h: 220, label: 'South · L3', sub: 'Metal Removal · 10:00–18:00 · 33xxxx' },
  E: { x: 600, y: 70, w: 160, h: 420, label: 'East · L3', sub: 'Software · QA · 9–17' },
}

// Booth numbers encode aisle and position, so a booth's digits give a meaningful
// *relative* spot inside its hall — never a surveyed one. Pins are laid out per
// hall rather than one at a time: a purely per-pin formula puts booths that share
// an aisle prefix on top of each other (the real target list produced 119
// overlapping pairs, some 2px apart), which makes them impossible to tap.
const MIN_GAP = 16
const EDGE = 10

export interface PlacedPin {
  id: string
  x: number
  y: number
}

interface PinInput {
  id: string
  booth: string
}

export function layoutPins(pins: PinInput[], hall: Hall): PlacedPin[] {
  const rect = HALL_RECTS[hall]
  const padX = 34
  const padY = 46
  const usableW = rect.w - padX * 2
  const usableH = rect.h - padY * 2

  // Seed each pin from its booth digits, then relax collisions.
  const placed: PlacedPin[] = pins.map(({ id, booth }) => {
    // Within a hall the leading digit is constant, so the aisle pair alone
    // collapses most booths into a couple of columns. Use the low digits for
    // the across-aisle spread and the aisle pair for depth, which is closer to
    // how the halls actually run.
    const digits = booth.replace(/\D/g, '')
    const aisle = Number(digits.slice(1, 3) || '0')
    const spot = Number(digits.slice(3) || '0')
    return {
      id,
      x: rect.x + padX + ((spot % 100) / 100) * usableW,
      y: rect.y + padY + (((aisle * 37 + Math.floor(spot / 100)) % 100) / 100) * usableH,
    }
  })

  // Push overlapping pins apart. A few passes is plenty at this scale and keeps
  // pins near their booth-derived position instead of scattering them.
  for (let pass = 0; pass < 240; pass++) {
    let moved = false
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]
        const b = placed[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        let dist = Math.hypot(dx, dy)
        if (dist >= MIN_GAP) continue
        if (dist === 0) {
          // Identical seeds: nudge deterministically so the result is stable.
          dx = ((i % 2) * 2 - 1) * 0.5
          dy = ((j % 2) * 2 - 1) * 0.5
          dist = Math.hypot(dx, dy)
        }
        const push = (MIN_GAP - dist) / 2
        const ux = (dx / dist) * push
        const uy = (dy / dist) * push
        a.x -= ux
        a.y -= uy
        b.x += ux
        b.y += uy
        moved = true
      }
    }
    // Clamp inside the loop: clamping only at the end pushes pins back onto each
    // other at the edges, undoing the separation we just computed.
    for (const pin of placed) {
      pin.x = Math.min(rect.x + rect.w - EDGE, Math.max(rect.x + EDGE, pin.x))
      pin.y = Math.min(rect.y + rect.h - EDGE, Math.max(rect.y + padY, pin.y))
    }
    if (!moved) break
  }

  return placed
}
