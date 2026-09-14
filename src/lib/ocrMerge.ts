import type { OcrResult } from './types'

export interface ContactDraft {
  name: string
  title: string
  company_name: string
  /** Target this contact belongs to; what puts it in that company's panel. */
  company_id: string | null
  email: string
  phone: string
  notes: string
}

export const EMPTY_DRAFT: ContactDraft = {
  name: '',
  title: '',
  company_name: '',
  company_id: null,
  email: '',
  phone: '',
  notes: '',
}

function clean(value: string | null | undefined): string {
  return value ? value.trim() : ''
}

export function mergeOcr(draft: ContactDraft, ocr: OcrResult): ContactDraft {
  const pick = (current: string, incoming: string | null | undefined) =>
    current.trim() ? current : clean(incoming)

  return {
    name: pick(draft.name, ocr.name),
    title: pick(draft.title, ocr.title),
    company_name: pick(draft.company_name, ocr.company),
    email: pick(draft.email, ocr.email),
    phone: pick(draft.phone, ocr.phone),
    notes: draft.notes,
    company_id: draft.company_id,
  }
}
