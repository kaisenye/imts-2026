import type { Company, Tier } from '../lib/types'
import type { Hall } from '../lib/hall'
import type { Locale, Strings } from './strings'

/**
 * Company records carry parallel `_zh` columns. Fall back to English whenever
 * a translation is missing — a company the user added themselves will never
 * have one, and a blank field is worse than the wrong language.
 */
export interface LocalizedCompany {
  name: string
  company_type: string | null
  ask: string | null
  bio: string | null
  fit: string | null
  opening_line: string | null
  asks: string[] | null
  watch_out: string | null
}

const pick = <T,>(zh: T | null | undefined, en: T | null): T | null =>
  zh !== null && zh !== undefined && zh !== ('' as unknown as T) ? zh : en

export function localizeCompany(company: Company, locale: Locale): LocalizedCompany {
  if (locale === 'en') {
    return {
      name: company.name,
      company_type: company.company_type,
      ask: company.ask,
      bio: company.bio,
      fit: company.fit,
      opening_line: company.opening_line,
      asks: company.asks,
      watch_out: company.watch_out,
    }
  }

  return {
    name: pick(company.name_zh, company.name) ?? company.name,
    company_type: pick(company.company_type_zh, company.company_type),
    ask: pick(company.ask_zh, company.ask),
    bio: pick(company.bio_zh, company.bio),
    fit: pick(company.fit_zh, company.fit),
    opening_line: pick(company.opening_line_zh, company.opening_line),
    asks: company.asks_zh && company.asks_zh.length > 0 ? company.asks_zh : company.asks,
    watch_out: pick(company.watch_out_zh, company.watch_out),
  }
}

/** Tier headings and hall names, keyed off the same string table as the UI. */
export function tierName(tier: Tier, t: Strings): string {
  return { A: t.tierA, B: t.tierB, C: t.tierC, D: t.tierD, M: t.tierM }[tier]
}

export function tierSub(tier: Tier, t: Strings): string {
  return { A: t.tierASub, B: t.tierBSub, C: t.tierCSub, D: t.tierDSub, M: t.tierMSub }[tier]
}

export function tierLabel(tier: Tier, t: Strings): string {
  return { A: t.tierALabel, B: t.tierBLabel, C: t.tierCLabel, D: t.tierDLabel, M: t.tierMLabel }[tier]
}

export function localHallName(hall: Hall | null, t: Strings): string {
  if (!hall) return '—'
  return { W: t.hallW, S: t.hallS, N: t.hallN, E: t.hallE }[hall]
}

export function localHallSub(hall: Hall, t: Strings): string {
  return { W: t.hallWSub, N: t.hallNSub, S: t.hallSSub, E: t.hallESub }[hall]
}
