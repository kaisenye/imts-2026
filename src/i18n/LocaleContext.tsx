import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { STRINGS, type Locale, type Strings } from './strings'

const KEY = 'hippsc_locale'

interface Ctx {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Strings
}

const LocaleCtx = createContext<Ctx | null>(null)

function initial(): Locale {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {
    // private mode: fall through to the browser preference
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')
    ? 'zh'
    : 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initial)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // preference just won't persist; not worth failing over
    }
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }, [])

  const value = useMemo(() => ({ locale, setLocale, t: STRINGS[locale] }), [locale, setLocale])

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
