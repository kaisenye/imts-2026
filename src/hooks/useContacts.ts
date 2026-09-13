import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Contact } from '../lib/types'

export function useContacts(companyId?: string) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('contacts').select('*').order('created_at', { ascending: false })
    if (companyId) query = query.eq('company_id', companyId)
    const { data, error: err } = await query
    if (err) setError(err.message)
    else setContacts((data ?? []) as Contact[])
    setLoading(false)
  }, [companyId])

  useEffect(() => {
    void load()
  }, [load])

  const add = useCallback(async (input: Partial<Contact>) => {
    const { data, error: err } = await supabase.from('contacts').insert(input).select().single()
    if (err) throw new Error(err.message)
    setContacts((prev) => [data as Contact, ...prev])
    return data as Contact
  }, [])

  const update = useCallback(async (id: string, patch: Partial<Contact>) => {
    const { data, error: err } = await supabase
      .from('contacts')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (err) throw new Error(err.message)
    setContacts((prev) => prev.map((c) => (c.id === id ? (data as Contact) : c)))
  }, [])

  const remove = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('contacts').delete().eq('id', id)
    if (err) throw new Error(err.message)
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { contacts, loading, error, add, update, remove, reload: load }
}
