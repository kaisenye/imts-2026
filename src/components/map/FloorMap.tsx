import { hallForBooths, type Hall } from '../../lib/hall'
import type { Company } from '../../lib/types'
import { HALL_RECTS, VIEWBOX, pinPosition } from '../../content/map'

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
  const placed = companies
    .map((company) => {
      const hall = hallForBooths(company.booths)
      if (!hall) return null
      return { company, hall, booth: company.booths[0] }
    })
    .filter((entry): entry is { company: Company; hall: Hall; booth: string } => entry !== null)

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
              fill={active ? 'var(--color-accent-soft)' : 'var(--surface)'}
              stroke="var(--line)"
            />
            <text x={rect.x + 12} y={rect.y + 22} className="fill-[var(--ink)] text-[16px] font-semibold">
              {rect.label}
            </text>
            <text x={rect.x + 12} y={rect.y + 38} className="fill-[var(--muted)] text-[11px]">
              {rect.sub}
            </text>
          </g>
        )
      })}

      {placed.map((entry, index) => {
        const { x, y } = pinPosition(entry.booth, entry.hall, index, placed.length)
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
              fill={isVisited ? 'var(--color-accent)' : 'var(--bg)'}
              stroke="var(--color-accent)"
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
          </g>
        )
      })}
    </svg>
  )
}
