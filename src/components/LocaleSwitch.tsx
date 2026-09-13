import { LOCALES } from '../i18n/strings'
import { useLocale } from '../i18n/LocaleContext'

export function LocaleSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLocale()

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-full border border-[var(--line-strong)] bg-[var(--raised)] p-0.5 ${className}`}
    >
      {LOCALES.map((l) => (
        <button
          key={l.value}
          onClick={() => setLocale(l.value)}
          aria-pressed={locale === l.value}
          className={`
            min-h-8 rounded-full px-2.5 text-[12.5px] font-medium transition-colors duration-150
            ${
              locale === l.value
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }
          `}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
