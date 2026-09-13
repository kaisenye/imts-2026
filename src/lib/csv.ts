import type { Contact } from './types'

const HEADERS = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Notes', 'Captured']

function escape(value: string | null): string {
  if (!value) return ''
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function contactsToCsv(contacts: Contact[]): string {
  const rows = contacts.map((c) =>
    [
      escape(c.name),
      escape(c.title),
      escape(c.company_name),
      escape(c.email),
      escape(c.phone),
      escape(c.notes),
      c.created_at.slice(0, 10),
    ].join(','),
  )
  return [HEADERS.join(','), ...rows].join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
