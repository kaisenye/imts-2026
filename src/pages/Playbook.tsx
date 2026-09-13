import { useState, type ReactNode } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import Thesis from '../content/thesis'
import Numbers from '../content/numbers'
import Rules from '../content/rules'
import Days from '../content/days'
import Scripts from '../content/scripts'
import Plays from '../content/plays'
import Followup from '../content/followup'

function Section({ title, body, openByDefault }: { title: string; body: ReactNode; openByDefault?: boolean }) {
  const [open, setOpen] = useState(!!openByDefault)
  return (
    <section className="mt-7">
      <button
        onClick={() => setOpen(!open)}
        className="
          group flex min-h-[44px] w-full items-center justify-between gap-3
          border-b-2 border-[var(--ink)] pb-2 text-left
          transition-colors duration-150 hover:border-[var(--accent)]
        "
      >
        <h2 className="font-display text-[21px] leading-tight transition-colors duration-150 group-hover:text-[var(--accent-ink)]">
          {title}
        </h2>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[var(--faint)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <svg width="12" height="8" viewBox="0 0 12 8">
            <path
              d="M1 1.5L6 6.5l5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      {open && <div className="animate-expand mt-3">{body}</div>}
    </section>
  )
}

export default function Playbook() {
  const { t } = useLocale()

  const SECTIONS: { id: string; title: string; body: ReactNode; openByDefault?: boolean }[] = [
    { id: 'thesis', title: t.secThesis, body: <Thesis />, openByDefault: true },
    { id: 'numbers', title: t.secNumbers, body: <Numbers /> },
    { id: 'rules', title: t.secRules, body: <Rules /> },
    { id: 'days', title: t.secDays, body: <Days /> },
    { id: 'scripts', title: t.secScripts, body: <Scripts /> },
    { id: 'plays', title: t.secPlays, body: <Plays /> },
    { id: 'followup', title: t.secFollowup, body: <Followup /> },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">
        HIPPSC · IMTS 2026
      </p>
      <h1 className="font-display mt-1 text-[clamp(32px,8vw,46px)] leading-[0.98]">
        {t.playbookTitle}
      </h1>
      <p className="mt-2.5 text-[13.5px] text-[var(--muted)]">
        {t.playbookVenue}
      </p>
      <div className="mt-5 h-px bg-[var(--line-strong)]" />

      {SECTIONS.map((section) => (
        <Section
          key={section.id}
          title={section.title}
          body={section.body}
          openByDefault={section.openByDefault}
        />
      ))}
    </div>
  )
}
