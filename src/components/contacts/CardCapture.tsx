import { useRef, useState, type ChangeEvent } from 'react'
import { supabase, CARDS_BUCKET } from '../../lib/supabase'
import { resizeImage } from '../../lib/image'
import { EMPTY_DRAFT, mergeOcr, type ContactDraft } from '../../lib/ocrMerge'
import { matchCompany } from '../../lib/matchCompany'
import type { Company, Contact, OcrResult } from '../../lib/types'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { ContactForm } from './ContactForm'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  open: boolean
  /** Pre-linked target, when capturing from inside a company's panel. */
  companyId: string | null
  /** All targets: offered in the picker, and used to resolve the card's company. */
  companies: Company[]
  defaultCompanyName?: string
  onSave: (input: Partial<Contact>) => Promise<void>
  onClose: () => void
}

export function CardCapture({ open, companyId, companies, defaultCompanyName, onSave, onClose }: Props) {
  const { t } = useLocale()
  const fileInput = useRef<HTMLInputElement>(null)
  const fresh = (): ContactDraft => ({
    ...EMPTY_DRAFT,
    company_name: defaultCompanyName ?? '',
    company_id: companyId,
  })
  const [draft, setDraft] = useState<ContactDraft>(fresh)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [rawOcr, setRawOcr] = useState<OcrResult | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setDraft(fresh())
    setImageUrl(null)
    setRawOcr(null)
    setStatus(null)
  }

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setStatus(t.uploading)
    try {
      const blob = await resizeImage(file)
      const path = `${crypto.randomUUID()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from(CARDS_BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg' })
      if (uploadError) throw new Error(uploadError.message)

      const { data } = supabase.storage.from(CARDS_BUCKET).getPublicUrl(path)
      setImageUrl(data.publicUrl)

      setStatus(t.readingCard)
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: data.publicUrl }),
      })

      if (!response.ok) {
        setStatus(t.ocrFailed)
        return
      }

      const ocr = (await response.json()) as OcrResult
      setRawOcr(ocr)
      setDraft((prev) => {
        const merged = mergeOcr(prev, ocr)
        // A card captured outside any panel has no link yet. Resolve the
        // company OCR read to a target so the contact shows up under it —
        // otherwise it only ever appears in the global list.
        if (!merged.company_id) {
          merged.company_id = matchCompany(ocr.company, companies)
        }
        return merged
      })
      setStatus(null)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    setBusy(true)
    try {
      await onSave({
        company_id: draft.company_id,
        name: draft.name.trim() || null,
        title: draft.title.trim() || null,
        company_name: draft.company_name.trim() || null,
        email: draft.email.trim() || null,
        email2: draft.email2.trim() || null,
        phone: draft.phone.trim() || null,
        phone2: draft.phone2.trim() || null,
        notes: draft.notes.trim() || null,
        card_image_url: imageUrl,
        raw_ocr: rawOcr,
      })
      reset()
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    reset()
    onClose()
  }

  return (
    <Sheet open={open} title={t.addContact} onClose={close}>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => void onFile(e)}
        className="hidden"
      />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Business card"
          className="mb-4 w-full rounded-lg border border-[var(--line)]"
        />
      ) : (
        <Button
          variant="primary"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="mb-4 w-full"
        >
          {t.photographCard}
        </Button>
      )}

      {status && <p className="mb-3 text-[14px] text-[var(--muted)]">{status}</p>}

      <ContactForm
        draft={draft}
        onChange={setDraft}
        onSubmit={save}
        onCancel={close}
        busy={busy}
        companies={companies}
      />
    </Sheet>
  )
}
