export type Hall = 'E' | 'N' | 'S' | 'W'

const DIGIT_TO_HALL: Record<string, Hall> = {
  '1': 'E',
  '2': 'N',
  '3': 'S',
  '4': 'W',
}

export const HALL_NAMES: Record<Hall, string> = {
  W: 'West',
  S: 'South',
  N: 'North',
  E: 'East',
}

export function hallForBooth(booth: string): Hall | null {
  if (!booth) return null
  const first = booth.trim()[0]
  return DIGIT_TO_HALL[first] ?? null
}

export function hallForBooths(booths: string[]): Hall | null {
  for (const booth of booths) {
    const hall = hallForBooth(booth)
    if (hall) return hall
  }
  return null
}

export function hallName(hall: Hall | null): string {
  return hall ? HALL_NAMES[hall] : '—'
}
