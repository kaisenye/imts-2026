import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!rawUrl || !publishableKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
}

// The dashboard shows the REST endpoint (…/rest/v1/), but supabase-js appends
// /rest/v1 itself — pasting that value verbatim yields /rest/v1/rest/v1/… and
// every query fails with PGRST125 "Invalid path specified in request URL".
// Accept either form.
const url = rawUrl.replace(/\/+$/, '').replace(/\/rest\/v\d+$/, '')

export const supabase = createClient(url, publishableKey)

export const CARDS_BUCKET = 'cards'
