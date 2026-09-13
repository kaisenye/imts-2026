import { hallForBooths, type Hall } from '../../lib/hall'
import type { Company } from '../../lib/types'
import { HALL_RECTS, VIEWBOX, layoutPins } from '../../content/map'
import { useLocale } from '../../i18n/LocaleContext'
import { localHallName, localHallSub } from '../../i18n/company'

interface Props {
  companies: Company[]
  visited: Record<string, boolean>
  selectedId: string | null
  hallFilter: Hall | null
  onSelect: (id: string) => void
  onSelectHall: (hall: Hall | null) => void
}

export function FloorMap({
  companies,
  visited,
  selectedId,
  hallFilter,
  onSelect,
  onSelectHall,
}: Props) {
  const { t } = useLocale()
  const byHall = new Map<Hall, { company: Company; booth: string }[]>()
  for (const company of companies) {
    const hall = hallForBooths(company.booths)
    if (!hall) continue
    const bucket = byHall.get(hall) ?? []
    bucket.push({ company, booth: company.booths[0] })
    byHall.set(hall, bucket)
  }

  // Lay each hall out as a group so pins sharing an aisle prefix separate
  // instead of stacking on the same coordinates.
  const placed = Array.from(byHall.entries()).flatMap(([hall, entries]) => {
    const positions = layoutPins(
      entries.map(({ company, booth }) => ({ id: company.id, booth })),
      hall,
    )
    return entries.map((entry, i) => ({
      company: entry.company,
      hall,
      x: positions[i].x,
      y: positions[i].y,
    }))
  })

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      className="block h-auto w-full bg-[var(--bg)]"
      role="img"
      aria-label="Schematic map of McCormick Place with target booths"
    >
      {(Object.keys(HALL_RECTS) as Hall[]).map((hall) => {
        const rect = HALL_RECTS[hall]
        const active = hallFilter === hall
        return (
          <g key={hall} onClick={() => onSelectHall(active ? null : hall)} className="cursor-pointer">
            <rect
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              rx={4}
              fill={active ? 'var(--accent-soft)' : 'var(--surface)'}
              stroke="var(--line)"
            />
            <text x={rect.x + 12} y={rect.y + 22} className="fill-[var(--ink)] text-[16px] font-semibold">
              {localHallName(hall, t)} · L3
            </text>
            <text x={rect.x + 12} y={rect.y + 38} className="fill-[var(--muted)] text-[11px]">
              {localHallSub(hall, t)}
            </text>
          </g>
        )
      })}

      {placed.map((entry) => {
        const { x, y } = entry
        const isVisited = !!visited[entry.company.id]
        const isSelected = selectedId === entry.company.id
        const dimmed = hallFilter !== null && hallFilter !== entry.hall
        return (
          <g
            key={entry.company.id}
            onClick={() => onSelect(entry.company.id)}
            className="cursor-pointer"
            opacity={dimmed ? 0.15 : 1}
            pointerEvents={dimmed ? 'none' : 'auto'}
          >
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 9 : 6}
              fill={isVisited ? 'var(--accent)' : 'var(--bg)'}
              stroke="var(--accent)"
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
          </g>
        )
      })}
    </svg>
  )
}
