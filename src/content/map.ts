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

// Booth numbers encode aisle and position. Spread pins across each hall rect by
// those digits so relative placement is meaningful; exact position is not surveyed.
export function pinPosition(booth: string, hall: Hall, index: number, total: number): { x: number; y: number } {
  const rect = HALL_RECTS[hall]
  const digits = booth.replace(/\D/g, '')
  const aisle = Number(digits.slice(1, 3) || '0')
  const spot = Number(digits.slice(3) || '0')

  const padX = 34
  const padY = 46
  const usableW = rect.w - padX * 2
  const usableH = rect.h - padY * 2

  // Aisle drives the horizontal band, spot drives depth; index breaks ties so
  // two booths in the same aisle never render exactly on top of each other.
  const xRatio = (aisle % 20) / 20
  const yRatio = (spot % 1000) / 1000
  const jitter = total > 1 ? ((index % 5) - 2) * 4 : 0

  return {
    x: rect.x + padX + xRatio * usableW + jitter,
    y: rect.y + padY + yRatio * usableH,
  }
}
