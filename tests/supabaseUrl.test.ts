import { describe, it, expect } from 'vitest'

// Mirrors the normalization in src/lib/supabase.ts. The Supabase dashboard
// surfaces the REST endpoint (…/rest/v1/), but supabase-js appends /rest/v1
// itself, so pasting that value verbatim produces /rest/v1/rest/v1/… and every
// query fails with PGRST125 "Invalid path specified in request URL".
const normalize = (raw: string) => raw.replace(/\/+$/, '').replace(/\/rest\/v\d+$/, '')

const PROJECT = 'https://woilnbiepnxidoncvfde.supabase.co'

describe('supabase url normalization', () => {
  it('leaves a bare project URL alone', () => {
    expect(normalize(PROJECT)).toBe(PROJECT)
  })

  it('strips the REST suffix the dashboard shows', () => {
    expect(normalize(`${PROJECT}/rest/v1/`)).toBe(PROJECT)
    expect(normalize(`${PROJECT}/rest/v1`)).toBe(PROJECT)
  })

  it('strips trailing slashes', () => {
    expect(normalize(`${PROJECT}/`)).toBe(PROJECT)
    expect(normalize(`${PROJECT}///`)).toBe(PROJECT)
  })

  it('does not eat a project ref that merely contains "rest"', () => {
    const forest = 'https://forest.supabase.co'
    expect(normalize(forest)).toBe(forest)
  })
})
