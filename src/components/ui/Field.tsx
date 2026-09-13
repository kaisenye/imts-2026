import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const CONTROL = `
  w-full rounded-lg border border-[var(--line-strong)] bg-[var(--raised)] text-base
  text-[var(--ink)] transition-colors duration-150
  placeholder:text-[var(--faint)] hover:border-[var(--muted)]
`

function Label({ children }: { children: string }) {
  return (
    <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.07em] text-[var(--muted)]">
      {children}
    </span>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, className = '', ...rest }: FieldProps) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input {...rest} className={`${CONTROL} min-h-11 px-3 ${className}`} />
    </label>
  )
}

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function TextArea({ label, className = '', ...rest }: AreaProps) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea {...rest} className={`${CONTROL} resize-y p-3 leading-relaxed ${className}`} />
    </label>
  )
}
