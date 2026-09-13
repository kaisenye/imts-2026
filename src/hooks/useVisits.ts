import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useVisits() {
  const [visited, setVisited] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('visits').select('company_id, visited')
    if (err) {
      setError(err.message)
      return
    }
    const map: Record<string, boolean> = {}
    for (const row of data ?? []) map[row.company_id] = row.visited
    setVisited(map)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Optimistic: the floor connection is slow and the toggle must feel instant.
  const toggle = useCallback(
    async (companyId: string) => {
      const next = !visited[companyId]
      setVisited((prev) => ({ ...prev, [companyId]: next }))
      const { error: err } = await supabase.from('visits').upsert({
        company_id: companyId,
        visited: next,
        visited_at: next ? new Date().toISOString() : null,
      })
      if (err) {
        setVisited((prev) => ({ ...prev, [companyId]: !next }))
        setError(err.message)
      }
    },
    [visited],
  )

  return { visited, toggle, error, reload: load }
}
