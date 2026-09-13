import { useLocale } from '../../i18n/LocaleContext'
import { LocaleSwitch } from '../LocaleSwitch'

/**
 * Mobile-only header strip. The language switch has to live somewhere every
 * page can reach; on desktop that is the sidebar, and under lg there is no
 * sidebar to put it in.
 */
export function TopBar() {
  const { t } = useLocale()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/95 px-4 py-2 backdrop-blur lg:hidden">
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
        HIPPSC · {t.brandSub}
      </span>
      <LocaleSwitch />
    </header>
  )
}
