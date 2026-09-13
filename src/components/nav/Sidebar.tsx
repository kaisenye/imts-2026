import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Playbook', end: true },
  { to: '/map', label: 'Map', end: false },
  { to: '/targets', label: 'Targets', end: false },
  { to: '/contacts', label: 'Contacts', end: false },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[var(--line)] bg-[var(--surface)] p-6 lg:block">
      <div className="font-display text-[16px]">HIPPSC</div>
      <div className="mb-7 text-[12px] uppercase tracking-[0.1em] text-[var(--faint)]">
        IMTS 2026
      </div>
      <nav className="flex flex-col gap-0.5">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-[14px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)]'
                  : 'text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--ink)]'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-8 border-t border-[var(--line)] pt-4 text-[11.5px] leading-relaxed text-[var(--faint)]">
        McCormick Place · Sept 14–19
      </p>
    </aside>
  )
}
