import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Playbook', end: true },
  { to: '/map', label: 'Map', end: false },
  { to: '/targets', label: 'Targets', end: false },
  { to: '/contacts', label: 'Contacts', end: false },
]

/**
 * Floating pill rather than an edge-to-edge bar: it sits clear of the home
 * indicator, and the inset makes the whole control reachable with one thumb.
 */
export function BottomTabs() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 px-3 lg:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.6rem)' }}
    >
      <div
        className="
          mx-auto flex max-w-md items-center gap-1 rounded-full border border-[var(--line-strong)]
          bg-[var(--raised)]/92 p-1.5 backdrop-blur-md
          shadow-[0_6px_24px_rgb(22_25_26/0.13),0_1px_2px_rgb(22_25_26/0.07)]
        "
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex min-h-11 flex-1 items-center justify-center rounded-full px-2 text-[12.5px] font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
