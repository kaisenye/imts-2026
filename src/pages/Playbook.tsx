import { useState, type ReactNode } from 'react'
import Thesis from '../content/thesis'
import Numbers from '../content/numbers'
import Rules from '../content/rules'
import Days from '../content/days'
import Scripts from '../content/scripts'
import Plays from '../content/plays'
import Followup from '../content/followup'

const SECTIONS: { id: string; title: string; body: ReactNode; openByDefault?: boolean }[] = [
  { id: 'thesis', title: 'The thesis', body: <Thesis />, openByDefault: true },
  { id: 'numbers', title: 'Numbers to carry', body: <Numbers /> },
  { id: 'rules', title: 'Rules of the game', body: <Rules /> },
  { id: 'days', title: 'Day by day', body: <Days /> },
  { id: 'scripts', title: 'Scripts', body: <Scripts /> },
  { id: 'plays', title: 'Plays', body: <Plays /> },
  { id: 'followup', title: 'Follow-up', body: <Followup /> },
]

function Section({ title, body, openByDefault }: { title: string; body: ReactNode; openByDefault?: boolean }) {
  const [open, setOpen] = useState(!!openByDefault)
  return (
    <section className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex min-h-[44px] w-full items-center justify-between border-b border-[var(--ink)] pb-2 text-left"
      >
        <h2 className="text-[22px] font-semibold">{title}</h2>
        <span className="text-[var(--faint)]">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-3">{body}</div>}
    </section>
  )
}

export default function Playbook() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-ink)]">
        HIPPSC · IMTS 2026
      </p>
      <h1 className="mt-1 text-[clamp(30px,7vw,42px)] font-semibold leading-tight tracking-tight">
        Field Playbook
      </h1>
      <p className="mt-2 text-[14px] text-[var(--muted)]">
        McCormick Place, Chicago · September 14–19, 2026
      </p>

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
