import { describe, it, expect } from 'vitest'
import { contactsToCsv } from '../src/lib/csv'
import type { Contact } from '../src/lib/types'

const base: Contact = {
  id: '1',
  company_id: 'yamazen',
  name: 'Jane Doe',
  title: 'Tooling Manager',
  company_name: 'Yamazen',
  email: 'jane@example.com',
  phone: '+1 555 0100',
  notes: null,
  card_image_url: null,
  raw_ocr: null,
  created_at: '2026-09-14T18:30:00Z',
}

describe('contactsToCsv', () => {
  it('emits a header row', () => {
    const csv = contactsToCsv([])
    expect(csv.split('\n')[0]).toBe('Name,Title,Company,Email,Phone,Notes,Captured')
  })

  it('writes one row per contact', () => {
    const csv = contactsToCsv([base])
    const rows = csv.split('\n')
    expect(rows).toHaveLength(2)
    expect(rows[1]).toContain('Jane Doe')
    expect(rows[1]).toContain('jane@example.com')
  })

  it('quotes fields containing commas or quotes', () => {
    const csv = contactsToCsv([{ ...base, title: 'VP, Sales', notes: 'said "call me"' }])
    expect(csv).toContain('"VP, Sales"')
    expect(csv).toContain('"said ""call me"""')
  })

  it('renders nulls as empty fields', () => {
    const csv = contactsToCsv([{ ...base, title: null, phone: null }])
    expect(csv.split('\n')[1]).toBe('Jane Doe,,Yamazen,jane@example.com,,,2026-09-14')
  })
})
