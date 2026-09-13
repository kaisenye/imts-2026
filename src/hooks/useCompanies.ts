import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Company } from '../lib/types'

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('companies')
      .select('*')
      .order('tier')
      .order('name')
    if (err) setError(err.message)
    else setCompanies((data ?? []) as Company[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = useCallback(async (input: Partial<Company> & { name: string; tier: Company['tier'] }) => {
    const id =
      input.id ??
      `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`
    const row = { ...input, id, is_default: false, archived: false }
    const { data, error: err } = await supabase.from('companies').insert(row).select().single()
    if (err) throw new Error(err.message)
    setCompanies((prev) => [...prev, data as Company])
    return data as Company
  }, [])

  const update = useCallback(async (id: string, patch: Partial<Company>) => {
    const { data, error: err } = await supabase
      .from('companies')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (err) throw new Error(err.message)
    setCompanies((prev) => prev.map((c) => (c.id === id ? (data as Company) : c)))
    return data as Company
  }, [])

  // Defaults archive (keeps their notes and survives a re-seed); custom rows delete.
  const remove = useCallback(
    async (company: Company) => {
      if (company.is_default) {
        await update(company.id, { archived: true })
        return
      }
      const { error: err } = await supabase.from('companies').delete().eq('id', company.id)
      if (err) throw new Error(err.message)
      setCompanies((prev) => prev.filter((c) => c.id !== company.id))
    },
    [update],
  )

  const restore = useCallback((id: string) => update(id, { archived: false }), [update])

  return { companies, loading, error, reload: load, create, update, remove, restore }
}
