# HIPPSC IMTS 2026 Field Playbook

Mobile-first field app for working the IMTS 2026 floor: playbook, target list,
visit tracking, notes, and business-card capture with OCR.

## Setup

1. **Supabase** — create a project, then in the SQL editor run, in order:
   - `supabase/schema.sql` — tables, indexes, RLS policies, storage bucket
   - `supabase/seed.sql` — the 88 default target companies

2. **Environment** — copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL` — project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — the publishable key (`sb_publishable_…`),
     from Settings → API Keys → "Publishable and secret API keys"
   - `VITE_APP_PASSCODE` — the passcode that unlocks the app
   - `OPENAI_API_KEY` — for card OCR (server-side only)

   The **secret key** (`sb_secret_…`) is deliberately unused: nothing in this
   app needs to bypass RLS. Never put it in a `VITE_*` variable — that would
   ship full database access to every browser.

3. **Local** — `npm install && npm run dev`

## Deploy

Vercel project from this repo. Add all four environment variables in project
settings. The three `VITE_*` values are build-time; `OPENAI_API_KEY` is used
only by `/api/ocr` and never reaches the browser.

Card capture calls `crypto.randomUUID()`, which requires a secure context —
fine on Vercel (HTTPS) and on `localhost`, but it will fail if you open a dev
server over plain HTTP from your phone. Use a tunnel for on-device testing.

## Regenerating seed data

`node scripts/extract.mjs` re-reads `hippsc-imts-2026-playbook.html` and
rewrites `supabase/seed.sql`. The seed uses `on conflict do nothing`, so
re-running it in Supabase never overwrites edits made in the app.

## Delete behavior

Seeded companies (`is_default = true`) are archived rather than deleted, so
their notes and contacts survive and a re-seed can't resurrect them. Companies
you add yourself are deleted outright, cascading their notes.

## Security note

The passcode is checked client-side and the Supabase publishable key ships in
the bundle with permissive RLS policies. Anyone with the URL and the passcode
has full read/write access. This is a private single-user tool; do not share
the link publicly or put anything sensitive in it.

## Tests

`npm test` — 31 tests covering hall derivation, company filtering, CSV export,
the OCR prefill merge, and floor-map pin placement.

`npm run build` typechecks the app, typechecks `api/ocr.ts` separately (it sits
outside the app's tsconfig), then builds.
