import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from './ui/Button'

const STORAGE_KEY = 'hippsc_auth'
const EXPECTED = import.meta.env.VITE_APP_PASSCODE

export function PasscodeGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ok'
    } catch {
      return false
    }
  })
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (EXPECTED && value === EXPECTED) {
      try {
        localStorage.setItem(STORAGE_KEY, 'ok')
      } catch {
        // private mode: stay unlocked for this session only
      }
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">HIPPSC IMTS</h1>
      <p className="mt-1 text-[15px] text-[var(--muted)]">Field playbook. Enter the passcode.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input
          type="password"
          inputMode="text"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Passcode"
          aria-label="Passcode"
          className="min-h-12 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base"
        />
        {error && <p className="text-[14px] text-[#b3372e]">Wrong passcode.</p>}
        <Button type="submit" variant="primary">
          Enter
        </Button>
      </form>
    </div>
  )
}
