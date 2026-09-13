import { describe, it, expect } from 'vitest'
import { websiteHref, websiteLabel } from '../src/lib/website'

describe('websiteHref', () => {
  it('adds https to a bare domain', () => {
    expect(websiteHref('yamazen.com')).toBe('https://yamazen.com')
    expect(websiteHref('www.yamazen.com/imts')).toBe('https://www.yamazen.com/imts')
  })

  it('keeps an existing http(s) scheme', () => {
    expect(websiteHref('https://a.com')).toBe('https://a.com')
    expect(websiteHref('http://a.com')).toBe('http://a.com')
  })

  it('refuses non-http schemes', () => {
    expect(websiteHref('javascript:alert(1)')).toBeNull()
    expect(websiteHref('data:text/html,hi')).toBeNull()
    expect(websiteHref('mailto:a@b.com')).toBeNull()
  })

  it('treats blank input as absent', () => {
    expect(websiteHref(null)).toBeNull()
    expect(websiteHref('')).toBeNull()
    expect(websiteHref('   ')).toBeNull()
  })
})

describe('websiteLabel', () => {
  it('strips scheme and www for display', () => {
    expect(websiteLabel('https://www.yamazen.com')).toBe('yamazen.com')
  })

  it('keeps a meaningful path', () => {
    expect(websiteLabel('ellisontechnologies.com/imts2026')).toBe('ellisontechnologies.com/imts2026')
  })

  it('drops a bare trailing slash', () => {
    expect(websiteLabel('https://a.com/')).toBe('a.com')
  })

  it('returns null for an unusable value', () => {
    expect(websiteLabel('javascript:alert(1)')).toBeNull()
    expect(websiteLabel(null)).toBeNull()
  })
})
