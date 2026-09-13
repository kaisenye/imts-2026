import { describe, it, expect } from 'vitest'
import { mergeOcr, type ContactDraft, EMPTY_DRAFT } from '../src/lib/ocrMerge'

describe('mergeOcr', () => {
  it('fills empty fields from OCR', () => {
    const result = mergeOcr(EMPTY_DRAFT, {
      name: 'Jane Doe',
      title: 'Tooling Manager',
      company: 'Yamazen',
      email: 'jane@example.com',
      phone: '555-0100',
    })
    expect(result.name).toBe('Jane Doe')
    expect(result.company_name).toBe('Yamazen')
    expect(result.phone).toBe('555-0100')
  })

  it('never overwrites a field the user already typed', () => {
    const draft: ContactDraft = { ...EMPTY_DRAFT, name: 'Typed Name' }
    const result = mergeOcr(draft, { name: 'OCR Name', email: 'a@b.com' })
    expect(result.name).toBe('Typed Name')
    expect(result.email).toBe('a@b.com')
  })

  it('ignores null and empty OCR values', () => {
    const draft: ContactDraft = { ...EMPTY_DRAFT, title: '' }
    const result = mergeOcr(draft, { name: null, title: '   ', email: undefined })
    expect(result.name).toBe('')
    expect(result.title).toBe('')
  })

  it('trims whitespace from OCR values', () => {
    const result = mergeOcr(EMPTY_DRAFT, { name: '  Jane Doe  ' })
    expect(result.name).toBe('Jane Doe')
  })

  it('returns the draft unchanged for an empty result', () => {
    const draft: ContactDraft = { ...EMPTY_DRAFT, name: 'Keep' }
    expect(mergeOcr(draft, {})).toEqual(draft)
  })
})
