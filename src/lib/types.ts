export type Tier = 'A' | 'B' | 'C' | 'D' | 'M'

export const TIER_LABELS: Record<Tier, string> = {
  A: 'Tier A',
  B: 'Tier B',
  C: 'Tier C',
  D: 'Tier D',
  M: 'Media',
}

export const TIER_NAMES: Record<Tier, string> = {
  A: 'Partnership candidates',
  B: 'Machine tool OEMs',
  C: 'Competitor recon',
  D: 'Automation & software',
  M: 'Exposure points',
}

export const TIER_SUBS: Record<Tier, string> = {
  A: 'distributors, importers, private-label, allies',
  B: 'co-demo and tooling-bundle asks',
  C: "learn, don't pitch",
  D: 'tool setup automation fit',
  M: 'in or near the West hall',
}

export const TIER_ORDER: Tier[] = ['A', 'B', 'C', 'D', 'M']

export interface Company {
  id: string
  name: string
  tier: Tier
  booths: string[]
  company_type: string | null
  hq: string | null
  ask: string | null
  who: string | null
  bio: string | null
  fit: string | null
  opening_line: string | null
  asks: string[] | null
  watch_out: string | null
  website: string | null
  name_zh: string | null
  company_type_zh: string | null
  ask_zh: string | null
  bio_zh: string | null
  fit_zh: string | null
  opening_line_zh: string | null
  asks_zh: string[] | null
  watch_out_zh: string | null
  is_default: boolean
  archived: boolean
  created_at: string
}

export interface Visit {
  company_id: string
  visited: boolean
  visited_at: string | null
}

export interface Note {
  id: string
  company_id: string
  body: string
  created_at: string
}

export interface Contact {
  id: string
  company_id: string | null
  name: string | null
  title: string | null
  company_name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  card_image_url: string | null
  raw_ocr: OcrResult | null
  created_at: string
}

export interface OcrResult {
  name?: string | null
  title?: string | null
  company?: string | null
  email?: string | null
  phone?: string | null
}
