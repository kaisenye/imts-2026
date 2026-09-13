import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Playbook', end: true },
  { to: '/map', label: 'Map', end: false },
  { to: '/targets', label: 'Targets', end: false },
  { to: '/contacts', label: 'Contacts', end: false },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-52 shrink-0 border-r border-[var(--line)] p-6 lg:block">
      <div className="text-[15px] font-semibold">HIPPSC</div>
      <div className="mb-6 text-[13px] text-[var(--muted)]">IMTS 2026 · Chicago</div>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-[14px] font-medium ${
                isActive
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface)]'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
