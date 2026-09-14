/**
 * Resolve a company name read off a business card to a target record.
 *
 * A contact is only visible in a company's panel through `company_id`, so
 * free text from OCR has to become a link. The bar is "confident or nothing":
 * a wrong link buries a card under the wrong company, which is worse than
 * leaving it unlinked for the rep to pick.
 */

interface Candidate {
  id: string
  name: string
  archived?: boolean
}

// Words that vary between a card and a record without changing the company.
const SUFFIX =
  /\b(incorporated|inc|corporation|corp|company|co|llc|ltd|limited|gmbh|ag|usa|america|north america)\b/g

// Shorter than this and containment is a coincidence ("BIG" is in a lot).
const MIN_FRAGMENT = 4

export function normalizeCompany(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // "(at DN Solutions)"
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(SUFFIX, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function matchCompany(
  text: string | null | undefined,
  companies: Candidate[],
): string | null {
  const needle = text ? normalizeCompany(text) : ''
  if (!needle) return null

  const live = companies
    .filter((c) => !c.archived)
    .map((c) => ({ id: c.id, key: normalizeCompany(c.name) }))
    .filter((c) => c.key)

  const exact = live.filter((c) => c.key === needle)
  if (exact.length === 1) return exact[0].id
  if (exact.length > 1) return null

  if (needle.length < MIN_FRAGMENT) return null

  const partial = live
    .filter((c) => c.key.length >= MIN_FRAGMENT && (c.key.includes(needle) || needle.includes(c.key)))
    .map((c) => ({ id: c.id, score: Math.min(c.key.length, needle.length) }))
    .sort((a, b) => b.score - a.score)

  if (partial.length === 0) return null
  // Two candidates as good as each other is a guess, not a match.
  if (partial.length > 1 && partial[0].score === partial[1].score) return null
  return partial[0].id
}
