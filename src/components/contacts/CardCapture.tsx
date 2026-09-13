import { useRef, useState, type ChangeEvent } from 'react'
import { supabase, CARDS_BUCKET } from '../../lib/supabase'
import { resizeImage } from '../../lib/image'
import { EMPTY_DRAFT, mergeOcr, type ContactDraft } from '../../lib/ocrMerge'
import type { Contact, OcrResult } from '../../lib/types'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { ContactForm } from './ContactForm'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  open: boolean
  companyId: string | null
  defaultCompanyName?: string
  onSave: (input: Partial<Contact>) => Promise<void>
  onClose: () => void
}

export function CardCapture({ open, companyId, defaultCompanyName, onSave, onClose }: Props) {
  const { t } = useLocale()
  const fileInput = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<ContactDraft>({
    ...EMPTY_DRAFT,
    company_name: defaultCompanyName ?? '',
  })
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [rawOcr, setRawOcr] = useState<OcrResult | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setDraft({ ...EMPTY_DRAFT, company_name: defaultCompanyName ?? '' })
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
      setDraft((prev) => mergeOcr(prev, ocr))
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
        company_id: companyId,
        name: draft.name.trim() || null,
        title: draft.title.trim() || null,
        company_name: draft.company_name.trim() || null,
        email: draft.email.trim() || null,
        phone: draft.phone.trim() || null,
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
      />
    </Sheet>
  )
}
