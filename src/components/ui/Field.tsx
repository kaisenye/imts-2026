import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] text-[var(--muted)]">{label}</span>
      <input
        {...rest}
        className="min-h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base text-[var(--ink)]"
      />
    </label>
  )
}

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function TextArea({ label, ...rest }: AreaProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] text-[var(--muted)]">{label}</span>
      <textarea
        {...rest}
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-base text-[var(--ink)]"
      />
    </label>
  )
}
