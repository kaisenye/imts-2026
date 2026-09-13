import { useRef, useState, type PointerEvent, type ReactNode, type WheelEvent } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 5

export function PanZoom({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null)
  const panStart = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null)

  const distance = () => {
    const [a, b] = Array.from(pointers.current.values())
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) {
      pinchStart.current = { distance: distance(), scale }
      panStart.current = null
    } else if (pointers.current.size === 1) {
      panStart.current = { x: event.clientX, y: event.clientY, offset }
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.current.size === 2 && pinchStart.current) {
      const next = (distance() / pinchStart.current.distance) * pinchStart.current.scale
      setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)))
    } else if (pointers.current.size === 1 && panStart.current && scale > 1) {
      setOffset({
        x: panStart.current.offset.x + (event.clientX - panStart.current.x),
        y: panStart.current.offset.y + (event.clientY - panStart.current.y),
      })
    }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinchStart.current = null
    if (pointers.current.size === 0) panStart.current = null
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return
    event.preventDefault()
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev - event.deltaY * 0.01)))
  }

  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="relative">
      <div
        className="touch-none overflow-hidden rounded-lg border border-[var(--line)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {children}
        </div>
      </div>
      {scale > 1 && (
        <button
          onClick={reset}
          className="absolute right-2 top-2 min-h-9 rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 text-[13px]"
        >
          Reset
        </button>
      )}
    </div>
  )
}
