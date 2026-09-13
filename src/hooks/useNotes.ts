import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Note } from '../lib/types'

export function useNotes(companyId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('notes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setNotes((data ?? []) as Note[])
    setLoading(false)
  }, [companyId])

  useEffect(() => {
    void load()
  }, [load])

  // Pessimistic on purpose: losing a note is worse than waiting 300ms.
  const add = useCallback(
    async (body: string) => {
      if (!companyId) return
      const { data, error: err } = await supabase
        .from('notes')
        .insert({ company_id: companyId, body })
        .select()
        .single()
      if (err) throw new Error(err.message)
      setNotes((prev) => [data as Note, ...prev])
    },
    [companyId],
  )

  const remove = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('notes').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { notes, loading, error, add, remove, reload: load }
}
