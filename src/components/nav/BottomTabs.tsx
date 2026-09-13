import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Playbook', end: true },
  { to: '/map', label: 'Map', end: false },
  { to: '/targets', label: 'Targets', end: false },
  { to: '/contacts', label: 'Contacts', end: false },
]

export function BottomTabs() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--line)] bg-[var(--bg)] lg:hidden">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex min-h-14 flex-1 items-center justify-center text-[13px] font-medium ${
              isActive ? 'text-[var(--color-accent-ink)]' : 'text-[var(--muted)]'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
