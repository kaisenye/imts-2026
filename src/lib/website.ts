/**
 * Company websites are typed by hand on a phone, so they arrive as
 * "acme.com", "www.acme.com/imts", or with a scheme already attached.
 * Normalize for href, and shorten for display.
 */

export function websiteHref(raw: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (!value) return null

  // Only http(s) may become a link — never javascript:, data:, or similar.
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return /^https?:\/\//i.test(value) ? value : null
  }
  return `https://${value}`
}

export function websiteLabel(raw: string | null): string | null {
  const href = websiteHref(raw)
  if (!href) return null
  try {
    const { hostname, pathname } = new URL(href)
    const host = hostname.replace(/^www\./, '')
    const path = pathname === '/' ? '' : pathname.replace(/\/$/, '')
    return `${host}${path}`
  } catch {
    return null
  }
}
