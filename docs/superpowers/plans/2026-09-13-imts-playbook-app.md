# HIPPSC IMTS 2026 Field App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-file `hippsc-imts-2026-playbook.html` into a mobile-first React app backed by Supabase, so a rep can work the IMTS floor on a phone: read the playbook, track visited targets, take notes, capture business cards with OCR, and add/edit/delete companies.

**Architecture:** Vite + React + TypeScript SPA on Vercel. Supabase Postgres holds companies, visits, notes, contacts; Supabase Storage holds card photos. Playbook prose stays static in React components. One Vercel serverless function calls OpenAI vision for card OCR. A shared passcode gates the app client-side.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS v4, React Router v6, `@supabase/supabase-js` v2, Vitest + React Testing Library, OpenAI `gpt-4o-mini`.

**Spec:** `docs/superpowers/specs/2026-09-13-imts-playbook-app-design.md`

---

## File Structure

```
public/
  favicon.ico                  Tab + home-screen icon (already in the repo)
api/
  ocr.ts                       Vercel serverless: image URL -> parsed card fields
scripts/
  extract.mjs                  One-time: parse legacy HTML -> seed.sql + content JSON
supabase/
  schema.sql                   Tables, indexes, RLS policies, storage bucket
  seed.sql                     88 default companies (generated)
src/
  main.tsx                     React root
  App.tsx                      Router + PasscodeGate + layout shell
  index.css                    Tailwind import + design tokens
  lib/
    supabase.ts                Typed Supabase client
    hall.ts                    Booth number -> hall letter/name
    types.ts                   Company, Note, Contact, Visit row types
    csv.ts                     Contacts -> CSV string
    image.ts                   Client-side image resize before upload
  hooks/
    useCompanies.ts            List/filter/create/update/archive companies
    useVisits.ts               Visited toggle with optimistic update
    useNotes.ts                Notes per company
    useContacts.ts             Contacts list + create
  components/
    PasscodeGate.tsx           Passcode screen, localStorage flag
    nav/BottomTabs.tsx         Mobile tab bar
    nav/Sidebar.tsx            Desktop sidebar (lg+)
    ui/Sheet.tsx               Bottom sheet / full-screen form container
    ui/Field.tsx               Labeled input, 16px font
    ui/Button.tsx              Primary/ghost button
    ui/ErrorBanner.tsx         Inline error with retry
    ui/Empty.tsx               Empty state
    company/CompanyRow.tsx     One row in the targets list
    company/CompanyCard.tsx    Expanded profile body
    company/CompanyForm.tsx    Add/edit company form
    company/FilterSheet.tsx    Tier/type/hall/status filters
    notes/NoteList.tsx         Notes thread
    notes/NoteComposer.tsx     Add-note textarea
    contacts/ContactForm.tsx   Add/edit contact, OCR prefill merge
    contacts/ContactList.tsx   Contact cards
    contacts/CardCapture.tsx   Camera input -> upload -> OCR -> form
    map/FloorMap.tsx           SVG halls + pins
    map/PanZoom.tsx            Pinch-zoom/pan wrapper
  content/
    map.ts                     Hall rects, booth->hall, pin layout constants
    thesis.tsx, numbers.tsx, rules.tsx, days.tsx,
    scripts.tsx, plays.tsx, followup.tsx
  pages/
    Playbook.tsx, MapPage.tsx, Targets.tsx, Company.tsx, Contacts.tsx
tests/
  hall.test.ts, filter.test.ts, csv.test.ts, ocrMerge.test.ts
```

---

## Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `vitest.config.ts`, `.env.example`

- [ ] **Step 1: Create the Vite project files**

`package.json`:
```json
{
  "name": "imts-2026",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^25.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.3",
    "vitest": "^2.0.5"
  }
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "emitDeclarationOnly": true,
    "outDir": "./node_modules/.tmp/tsconfig-node"
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

A referenced project cannot set `noEmit` (TypeScript errors with TS6310), so
this one emits declarations only, into a throwaway directory. Without the
`outDir`, `tsc -b` drops `vite.config.js` and friends in the repo root.

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/favicon.ico" />
    <title>HIPPSC IMTS Field Playbook</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`.env.example`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_PASSCODE=
OPENAI_API_KEY=
```

- [ ] **Step 2: Write the design tokens and Tailwind entry**

`src/index.css`:
```css
@import "tailwindcss";

@theme {
  --font-sans: Inter, system-ui, -apple-system, sans-serif;
  --color-accent: #1b7f4b;
  --color-accent-ink: #166b3f;
  --color-accent-soft: #e7f3ec;
}

:root {
  --bg: #ffffff;
  --surface: #fafafa;
  --ink: #111512;
  --muted: #6a716c;
  --faint: #9aa19c;
  --line: #e6e9e7;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0d0f0e;
    --surface: #161918;
    --ink: #f2f4f3;
    --muted: #9aa19c;
    --faint: #6a716c;
    --line: #262b29;
  }
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
}

input, select, textarea {
  font-size: 16px;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **Step 3: Write a minimal root that renders**

`src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

`src/App.tsx` (placeholder, replaced in Task 9):
```tsx
export default function App() {
  return <div className="p-4">HIPPSC IMTS</div>
}
```

- [ ] **Step 4: Install and verify the build**

Run:
```bash
npm install && npm run build
```
Expected: `vite build` completes, `dist/index.html` exists, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts vitest.config.ts tsconfig.json tsconfig.node.json index.html .env.example src/
git commit -m "chore: scaffold Vite + React + TS + Tailwind project"
```

---

## Task 2: Booth-to-hall derivation (TDD)

The legacy HTML maps the first digit of a booth number to a hall: `{"1":"E","2":"N","3":"S","4":"W"}`. Hall is derived, never stored.

**Files:**
- Create: `src/lib/hall.ts`
- Test: `tests/hall.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/hall.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { hallForBooth, hallForBooths, hallName, HALL_NAMES } from '../src/lib/hall'

describe('hallForBooth', () => {
  it('maps first digit to hall letter', () => {
    expect(hallForBooth('134506')).toBe('E')
    expect(hallForBooth('236744')).toBe('N')
    expect(hallForBooth('338536')).toBe('S')
    expect(hallForBooth('432228')).toBe('W')
  })

  it('returns null for unknown or malformed booths', () => {
    expect(hallForBooth('999999')).toBeNull()
    expect(hallForBooth('')).toBeNull()
    expect(hallForBooth('abc')).toBeNull()
  })
})

describe('hallForBooths', () => {
  it('uses the first booth in the list', () => {
    expect(hallForBooths(['338100', '432212'])).toBe('S')
  })

  it('falls back to the first booth that resolves', () => {
    expect(hallForBooths(['bogus', '432212'])).toBe('W')
  })

  it('returns null for an empty list', () => {
    expect(hallForBooths([])).toBeNull()
  })
})

describe('hallName', () => {
  it('gives the display name', () => {
    expect(hallName('W')).toBe('West')
    expect(hallName(null)).toBe('—')
  })

  it('exposes all four halls', () => {
    expect(Object.keys(HALL_NAMES).sort()).toEqual(['E', 'N', 'S', 'W'])
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run tests/hall.test.ts`
Expected: FAIL — `Failed to resolve import "../src/lib/hall"`.

- [ ] **Step 3: Implement**

`src/lib/hall.ts`:
```ts
export type Hall = 'E' | 'N' | 'S' | 'W'

const DIGIT_TO_HALL: Record<string, Hall> = {
  '1': 'E',
  '2': 'N',
  '3': 'S',
  '4': 'W',
}

export const HALL_NAMES: Record<Hall, string> = {
  W: 'West',
  S: 'South',
  N: 'North',
  E: 'East',
}

export function hallForBooth(booth: string): Hall | null {
  if (!booth) return null
  const first = booth.trim()[0]
  return DIGIT_TO_HALL[first] ?? null
}

export function hallForBooths(booths: string[]): Hall | null {
  for (const booth of booths) {
    const hall = hallForBooth(booth)
    if (hall) return hall
  }
  return null
}

export function hallName(hall: Hall | null): string {
  return hall ? HALL_NAMES[hall] : '—'
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run tests/hall.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hall.ts tests/hall.test.ts
git commit -m "feat: derive hall from booth number"
```

---

## Task 3: Types and Supabase client

**Files:**
- Create: `src/lib/types.ts`, `src/lib/supabase.ts`

- [ ] **Step 1: Write the row types**

`src/lib/types.ts`:
```ts
export type Tier = 'A' | 'B' | 'C' | 'D' | 'M'

export const TIER_LABELS: Record<Tier, string> = {
  A: 'Tier A',
  B: 'Tier B',
  C: 'Tier C',
  D: 'Tier D',
  M: 'Media',
}

export const TIER_NAMES: Record<Tier, string> = {
  A: 'Partnership candidates',
  B: 'Machine tool OEMs',
  C: 'Competitor recon',
  D: 'Automation & software',
  M: 'Exposure points',
}

export const TIER_SUBS: Record<Tier, string> = {
  A: 'distributors, importers, private-label, allies',
  B: 'co-demo and tooling-bundle asks',
  C: "learn, don't pitch",
  D: 'tool setup automation fit',
  M: 'in or near the West hall',
}

export const TIER_ORDER: Tier[] = ['A', 'B', 'C', 'D', 'M']

export interface Company {
  id: string
  name: string
  tier: Tier
  booths: string[]
  company_type: string | null
  hq: string | null
  ask: string | null
  who: string | null
  bio: string | null
  fit: string | null
  opening_line: string | null
  asks: string[] | null
  watch_out: string | null
  is_default: boolean
  archived: boolean
  created_at: string
}

export interface Visit {
  company_id: string
  visited: boolean
  visited_at: string | null
}

export interface Note {
  id: string
  company_id: string
  body: string
  created_at: string
}

export interface Contact {
  id: string
  company_id: string | null
  name: string | null
  title: string | null
  company_name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  card_image_url: string | null
  raw_ocr: OcrResult | null
  created_at: string
}

export interface OcrResult {
  name?: string | null
  title?: string | null
  company?: string | null
  email?: string | null
  phone?: string | null
}
```

- [ ] **Step 2: Write the client**

`src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
}

export const supabase = createClient(url, publishableKey)

export const CARDS_BUCKET = 'cards'
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: exit code 0, no output.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/supabase.ts
git commit -m "feat: add row types and Supabase client"
```

---

## Task 4: Database schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Write the schema**

`supabase/schema.sql`:
```sql
-- HIPPSC IMTS 2026 field app schema.
-- Single-user private tool: RLS is on, policies are permissive by design.

create table if not exists companies (
  id            text primary key,
  name          text not null,
  tier          text not null check (tier in ('A','B','C','D','M')),
  booths        text[] not null default '{}',
  company_type  text,
  hq            text,
  ask           text,
  who           text,
  bio           text,
  fit           text,
  opening_line  text,
  asks          text[],
  watch_out     text,
  is_default    boolean not null default false,
  archived      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists visits (
  company_id  text primary key references companies(id) on delete cascade,
  visited     boolean not null default false,
  visited_at  timestamptz
);

create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  company_id  text not null references companies(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists contacts (
  id              uuid primary key default gen_random_uuid(),
  company_id      text references companies(id) on delete set null,
  name            text,
  title           text,
  company_name    text,
  email           text,
  phone           text,
  notes           text,
  card_image_url  text,
  raw_ocr         jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists notes_company_idx on notes (company_id, created_at desc);
create index if not exists contacts_company_idx on contacts (company_id, created_at desc);
create index if not exists companies_tier_idx on companies (tier);
create index if not exists companies_archived_idx on companies (archived);

alter table companies enable row level security;
alter table visits    enable row level security;
alter table notes     enable row level security;
alter table contacts  enable row level security;

drop policy if exists anon_all on companies;
drop policy if exists anon_all on visits;
drop policy if exists anon_all on notes;
drop policy if exists anon_all on contacts;

create policy anon_all on companies for all using (true) with check (true);
create policy anon_all on visits    for all using (true) with check (true);
create policy anon_all on notes     for all using (true) with check (true);
create policy anon_all on contacts  for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('cards', 'cards', true)
on conflict (id) do nothing;

drop policy if exists cards_all on storage.objects;
create policy cards_all on storage.objects
  for all using (bucket_id = 'cards') with check (bucket_id = 'cards');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema with permissive RLS"
```

---

## Task 5: Extract legacy content into seed data

The legacy file holds `TARGETS` (88 entries: id, tier `t`, name `n`, booths `b`, ask `a`, optional who `w`) and `INFO` (per-id: type `ty`, hq, bio, fit, opening line `op`, asks `ak`, watch-out `wa`). Both must land in `seed.sql`.

**Files:**
- Create: `scripts/extract.mjs`, `supabase/seed.sql` (generated)
- Read: `hippsc-imts-2026-playbook.html`

- [ ] **Step 1: Write the extraction script**

`scripts/extract.mjs`:
```js
// One-time extraction of TARGETS + INFO from the legacy playbook HTML
// into supabase/seed.sql. Run: node scripts/extract.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('hippsc-imts-2026-playbook.html', 'utf8')

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker)
  if (start === -1) throw new Error(`marker not found: ${startMarker}`)
  const end = source.indexOf(endMarker, start + startMarker.length)
  if (end === -1) throw new Error(`end marker not found after ${startMarker}`)
  return source.slice(start, end + endMarker.length)
}

// TARGETS is a JS array literal; INFO is built by Object.assign calls.
const targetsSrc = sliceBetween(html, 'var TARGETS=[', '\n];')
const infoStart = html.indexOf('var INFO={};')
const infoEnd = html.indexOf('var HALL=')
if (infoStart === -1 || infoEnd === -1) throw new Error('INFO block not found')
const infoSrc = html.slice(infoStart, infoEnd)

// Evaluate both in a sandboxed-enough scope: this is our own trusted file.
const TARGETS = new Function(`${targetsSrc}\nreturn TARGETS;`)()
const INFO = new Function(`${infoSrc}\nreturn INFO;`)()

console.log(`targets: ${TARGETS.length}, info entries: ${Object.keys(INFO).length}`)

const q = (value) => {
  if (value === undefined || value === null || value === '') return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

const qArray = (values) => {
  if (!values || values.length === 0) return `'{}'`
  const inner = values.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(',')
  return `'{${inner.replace(/'/g, "''")}}'`
}

const rows = TARGETS.map((t) => {
  const info = INFO[t.id] || {}
  return `  (${q(t.id)}, ${q(t.n)}, ${q(t.t)}, ${qArray(t.b)}, ${q(info.ty)}, ${q(info.hq)}, ${q(t.a)}, ${q(t.w)}, ${q(info.bio)}, ${q(info.fit)}, ${q(info.op)}, ${qArray(info.ak)}, ${q(info.wa)}, true, false)`
})

const sql = `-- Generated by scripts/extract.mjs from hippsc-imts-2026-playbook.html
-- ${TARGETS.length} default companies. Re-runnable: existing ids are left alone.

insert into companies
  (id, name, tier, booths, company_type, hq, ask, who, bio, fit, opening_line, asks, watch_out, is_default, archived)
values
${rows.join(',\n')}
on conflict (id) do nothing;

insert into visits (company_id, visited)
select id, false from companies
on conflict (company_id) do nothing;
`

writeFileSync('supabase/seed.sql', sql)
console.log(`wrote supabase/seed.sql (${rows.length} rows)`)
```

- [ ] **Step 2: Run it and verify the row count**

Run:
```bash
node scripts/extract.mjs && grep -c "^  ('" supabase/seed.sql
```
Expected: prints `targets: 88, info entries: 88`, then `wrote supabase/seed.sql (88 rows)`, then `88`.

If the target count is not 88, stop and inspect the legacy file — the markers moved.

- [ ] **Step 3: Spot-check a row with an apostrophe and a multi-booth entry**

Run:
```bash
grep -o "('productivity'[^\n]\{0,200\}" supabase/seed.sql | head -1
grep -c "CMTBA" supabase/seed.sql
```
Expected: the `productivity` row shows `'{"338100","338519","338630"}'` for booths; `CMTBA` appears once (its name contains an apostrophe — confirm it reads `Builders'' Assoc.` with a doubled quote).

- [ ] **Step 4: Commit**

```bash
git add scripts/extract.mjs supabase/seed.sql
git commit -m "feat: extract 88 default companies into seed SQL"
```

---

## Task 6: Company filter logic (TDD)

The targets page filters by query, tier, type, hall, and visited status. Pure function, tested in isolation.

**Files:**
- Create: `src/lib/filter.ts`
- Test: `tests/filter.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/filter.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { filterCompanies, DEFAULT_FILTERS } from '../src/lib/filter'
import type { Company } from '../src/lib/types'

const make = (over: Partial<Company>): Company => ({
  id: 'x',
  name: 'X',
  tier: 'A',
  booths: ['432000'],
  company_type: 'Importer',
  hq: null,
  ask: null,
  who: null,
  bio: null,
  fit: null,
  opening_line: null,
  asks: null,
  watch_out: null,
  is_default: true,
  archived: false,
  created_at: '2026-01-01T00:00:00Z',
  ...over,
})

const yamazen = make({ id: 'yamazen', name: 'Yamazen', tier: 'A', booths: ['338536'], company_type: 'Importer', ask: 'Brother SPEEDIO is a BT30 world' })
const haimer = make({ id: 'haimer', name: 'HAIMER USA', tier: 'C', booths: ['431510'], company_type: 'Competitor' })
const gone = make({ id: 'gone', name: 'Archived Co', archived: true })
const all = [yamazen, haimer, gone]
const visited = { yamazen: true }

describe('filterCompanies', () => {
  it('hides archived companies by default', () => {
    const result = filterCompanies(all, DEFAULT_FILTERS, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen', 'haimer'])
  })

  it('shows only archived when status is archived', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, status: 'archived' }, visited)
    expect(result.map((c) => c.id)).toEqual(['gone'])
  })

  it('matches the query against name', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, q: 'haim' }, visited)
    expect(result.map((c) => c.id)).toEqual(['haimer'])
  })

  it('matches the query against booth number', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, q: '338536' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })

  it('matches the query against the ask text', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, q: 'speedio' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })

  it('filters by tier', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, tier: 'C' }, visited)
    expect(result.map((c) => c.id)).toEqual(['haimer'])
  })

  it('filters by company type', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, type: 'Importer' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })

  it('filters by hall derived from booth', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, hall: 'W' }, visited)
    expect(result.map((c) => c.id)).toEqual(['haimer'])
  })

  it('filters by visited status', () => {
    expect(filterCompanies(all, { ...DEFAULT_FILTERS, status: 'visited' }, visited).map((c) => c.id)).toEqual(['yamazen'])
    expect(filterCompanies(all, { ...DEFAULT_FILTERS, status: 'todo' }, visited).map((c) => c.id)).toEqual(['haimer'])
  })

  it('combines filters', () => {
    const result = filterCompanies(all, { ...DEFAULT_FILTERS, tier: 'A', status: 'visited' }, visited)
    expect(result.map((c) => c.id)).toEqual(['yamazen'])
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run tests/filter.test.ts`
Expected: FAIL — cannot resolve `../src/lib/filter`.

- [ ] **Step 3: Implement**

`src/lib/filter.ts`:
```ts
import { hallForBooths, type Hall } from './hall'
import type { Company, Tier } from './types'

export type StatusFilter = 'all' | 'visited' | 'todo' | 'archived'

export interface Filters {
  q: string
  tier: Tier | 'all'
  type: string | 'all'
  hall: Hall | 'all'
  status: StatusFilter
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  tier: 'all',
  type: 'all',
  hall: 'all',
  status: 'all',
}

function matchesQuery(company: Company, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    company.name,
    company.ask,
    company.company_type,
    company.hq,
    company.who,
    company.bio,
    ...company.booths,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

export function filterCompanies(
  companies: Company[],
  filters: Filters,
  visited: Record<string, boolean>,
): Company[] {
  return companies.filter((company) => {
    if (filters.status === 'archived') {
      if (!company.archived) return false
    } else if (company.archived) {
      return false
    }

    if (!matchesQuery(company, filters.q)) return false
    if (filters.tier !== 'all' && company.tier !== filters.tier) return false
    if (filters.type !== 'all' && company.company_type !== filters.type) return false

    if (filters.hall !== 'all' && hallForBooths(company.booths) !== filters.hall) return false

    if (filters.status === 'visited' && !visited[company.id]) return false
    if (filters.status === 'todo' && visited[company.id]) return false

    return true
  })
}

export function activeFilterCount(filters: Filters): number {
  let count = 0
  if (filters.tier !== 'all') count++
  if (filters.type !== 'all') count++
  if (filters.hall !== 'all') count++
  if (filters.status !== 'all') count++
  return count
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run tests/filter.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filter.ts tests/filter.test.ts
git commit -m "feat: add company filter logic"
```

---

## Task 7: CSV export (TDD)

**Files:**
- Create: `src/lib/csv.ts`
- Test: `tests/csv.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/csv.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { contactsToCsv } from '../src/lib/csv'
import type { Contact } from '../src/lib/types'

const base: Contact = {
  id: '1',
  company_id: 'yamazen',
  name: 'Jane Doe',
  title: 'Tooling Manager',
  company_name: 'Yamazen',
  email: 'jane@example.com',
  phone: '+1 555 0100',
  notes: null,
  card_image_url: null,
  raw_ocr: null,
  created_at: '2026-09-14T18:30:00Z',
}

describe('contactsToCsv', () => {
  it('emits a header row', () => {
    const csv = contactsToCsv([])
    expect(csv.split('\n')[0]).toBe('Name,Title,Company,Email,Phone,Notes,Captured')
  })

  it('writes one row per contact', () => {
    const csv = contactsToCsv([base])
    const rows = csv.split('\n')
    expect(rows).toHaveLength(2)
    expect(rows[1]).toContain('Jane Doe')
    expect(rows[1]).toContain('jane@example.com')
  })

  it('quotes fields containing commas or quotes', () => {
    const csv = contactsToCsv([{ ...base, title: 'VP, Sales', notes: 'said "call me"' }])
    expect(csv).toContain('"VP, Sales"')
    expect(csv).toContain('"said ""call me"""')
  })

  it('renders nulls as empty fields', () => {
    const csv = contactsToCsv([{ ...base, title: null, phone: null }])
    expect(csv.split('\n')[1]).toBe('Jane Doe,,Yamazen,jane@example.com,,,2026-09-14')
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run tests/csv.test.ts`
Expected: FAIL — cannot resolve `../src/lib/csv`.

- [ ] **Step 3: Implement**

`src/lib/csv.ts`:
```ts
import type { Contact } from './types'

const HEADERS = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Notes', 'Captured']

function escape(value: string | null): string {
  if (!value) return ''
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function contactsToCsv(contacts: Contact[]): string {
  const rows = contacts.map((c) =>
    [
      escape(c.name),
      escape(c.title),
      escape(c.company_name),
      escape(c.email),
      escape(c.phone),
      escape(c.notes),
      c.created_at.slice(0, 10),
    ].join(','),
  )
  return [HEADERS.join(','), ...rows].join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run tests/csv.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/csv.ts tests/csv.test.ts
git commit -m "feat: add contacts CSV export"
```

---

## Task 8: OCR prefill merge (TDD)

OCR output must never clobber something the rep already typed, and must survive a partial or empty response.

**Files:**
- Create: `src/lib/ocrMerge.ts`
- Test: `tests/ocrMerge.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/ocrMerge.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mergeOcr, type ContactDraft, EMPTY_DRAFT } from '../src/lib/ocrMerge'

describe('mergeOcr', () => {
  it('fills empty fields from OCR', () => {
    const result = mergeOcr(EMPTY_DRAFT, {
      name: 'Jane Doe',
      title: 'Tooling Manager',
      company: 'Yamazen',
      email: 'jane@example.com',
      phone: '555-0100',
    })
    expect(result.name).toBe('Jane Doe')
    expect(result.company_name).toBe('Yamazen')
    expect(result.phone).toBe('555-0100')
  })

  it('never overwrites a field the user already typed', () => {
    const draft: ContactDraft = { ...EMPTY_DRAFT, name: 'Typed Name' }
    const result = mergeOcr(draft, { name: 'OCR Name', email: 'a@b.com' })
    expect(result.name).toBe('Typed Name')
    expect(result.email).toBe('a@b.com')
  })

  it('ignores null and empty OCR values', () => {
    const draft: ContactDraft = { ...EMPTY_DRAFT, title: '' }
    const result = mergeOcr(draft, { name: null, title: '   ', email: undefined })
    expect(result.name).toBe('')
    expect(result.title).toBe('')
  })

  it('trims whitespace from OCR values', () => {
    const result = mergeOcr(EMPTY_DRAFT, { name: '  Jane Doe  ' })
    expect(result.name).toBe('Jane Doe')
  })

  it('returns the draft unchanged for an empty result', () => {
    const draft: ContactDraft = { ...EMPTY_DRAFT, name: 'Keep' }
    expect(mergeOcr(draft, {})).toEqual(draft)
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run tests/ocrMerge.test.ts`
Expected: FAIL — cannot resolve `../src/lib/ocrMerge`.

- [ ] **Step 3: Implement**

`src/lib/ocrMerge.ts`:
```ts
import type { OcrResult } from './types'

export interface ContactDraft {
  name: string
  title: string
  company_name: string
  email: string
  phone: string
  notes: string
}

export const EMPTY_DRAFT: ContactDraft = {
  name: '',
  title: '',
  company_name: '',
  email: '',
  phone: '',
  notes: '',
}

function clean(value: string | null | undefined): string {
  return value ? value.trim() : ''
}

export function mergeOcr(draft: ContactDraft, ocr: OcrResult): ContactDraft {
  const pick = (current: string, incoming: string | null | undefined) =>
    current.trim() ? current : clean(incoming)

  return {
    name: pick(draft.name, ocr.name),
    title: pick(draft.title, ocr.title),
    company_name: pick(draft.company_name, ocr.company),
    email: pick(draft.email, ocr.email),
    phone: pick(draft.phone, ocr.phone),
    notes: draft.notes,
  }
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run tests/ocrMerge.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ocrMerge.ts tests/ocrMerge.test.ts
git commit -m "feat: merge OCR results without clobbering typed fields"
```

---

## Task 9: Passcode gate, shell, and navigation

**Files:**
- Create: `src/components/PasscodeGate.tsx`, `src/components/nav/BottomTabs.tsx`, `src/components/nav/Sidebar.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Field.tsx`, `src/components/ui/ErrorBanner.tsx`, `src/components/ui/Empty.tsx`
- Modify: `src/App.tsx` (replace the Task 1 placeholder)

- [ ] **Step 1: Write the shared UI primitives**

`src/components/ui/Button.tsx`:
```tsx
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
}

const STYLES = {
  primary: 'bg-[var(--color-accent)] text-white border-transparent',
  ghost: 'bg-transparent text-[var(--ink)] border-[var(--line)]',
  danger: 'bg-transparent text-[#b3372e] border-[var(--line)]',
}

export function Button({ variant = 'ghost', className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`min-h-11 rounded-lg border px-4 text-[15px] font-medium disabled:opacity-50 ${STYLES[variant]} ${className}`}
    />
  )
}
```

`src/components/ui/Field.tsx`:
```tsx
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] text-[var(--muted)]">{label}</span>
      <input
        {...rest}
        className="min-h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base text-[var(--ink)]"
      />
    </label>
  )
}

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function TextArea({ label, ...rest }: AreaProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] text-[var(--muted)]">{label}</span>
      <textarea
        {...rest}
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-base text-[var(--ink)]"
      />
    </label>
  )
}
```

`src/components/ui/ErrorBanner.tsx`:
```tsx
import { Button } from './Button'

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e9c9c6] bg-[#fdf3f2] p-3 text-[14px] text-[#b3372e]">
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button onClick={onRetry} className="min-h-9 px-3 text-[13px]">
          Retry
        </Button>
      )}
    </div>
  )
}
```

`src/components/ui/Empty.tsx`:
```tsx
export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-[15px] text-[var(--muted)]">{children}</p>
}
```

- [ ] **Step 2: Write the passcode gate**

`src/components/PasscodeGate.tsx`:
```tsx
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
```

- [ ] **Step 3: Write the navigation**

`src/components/nav/BottomTabs.tsx`:
```tsx
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
```

`src/components/nav/Sidebar.tsx`:
```tsx
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Playbook', end: true },
  { to: '/map', label: 'Map', end: false },
  { to: '/targets', label: 'Targets', end: false },
  { to: '/contacts', label: 'Contacts', end: false },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-52 shrink-0 border-r border-[var(--line)] p-6 lg:block">
      <div className="text-[15px] font-semibold">HIPPSC</div>
      <div className="mb-6 text-[13px] text-[var(--muted)]">IMTS 2026 · Chicago</div>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-[14px] font-medium ${
                isActive
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface)]'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 4: Wire the router shell**

Replace `src/App.tsx` entirely:
```tsx
import { Routes, Route } from 'react-router-dom'
import { PasscodeGate } from './components/PasscodeGate'
import { BottomTabs } from './components/nav/BottomTabs'
import { Sidebar } from './components/nav/Sidebar'
import Playbook from './pages/Playbook'
import MapPage from './pages/MapPage'
import Targets from './pages/Targets'
import Company from './pages/Company'
import Contacts from './pages/Contacts'

export default function App() {
  return (
    <PasscodeGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-20 lg:pb-8">
          <Routes>
            <Route path="/" element={<Playbook />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/company/:id" element={<Company />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </main>
        <BottomTabs />
      </div>
    </PasscodeGate>
  )
}
```

- [ ] **Step 5: Create placeholder pages so the build passes**

Create each of `src/pages/Playbook.tsx`, `src/pages/MapPage.tsx`, `src/pages/Targets.tsx`, `src/pages/Company.tsx`, `src/pages/Contacts.tsx` with the matching component name, for example `src/pages/Playbook.tsx`:
```tsx
export default function Playbook() {
  return <div className="p-4">Playbook</div>
}
```
Repeat with `MapPage`, `Targets`, `Company`, `Contacts` as the exported function names in their respective files.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components src/pages
git commit -m "feat: add passcode gate, nav shell, and UI primitives"
```

---

## Task 10: Data hooks

**Files:**
- Create: `src/hooks/useCompanies.ts`, `src/hooks/useVisits.ts`, `src/hooks/useNotes.ts`, `src/hooks/useContacts.ts`

- [ ] **Step 1: Write the companies hook**

`src/hooks/useCompanies.ts`:
```ts
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
```

- [ ] **Step 2: Write the visits hook with optimistic toggle**

`src/hooks/useVisits.ts`:
```ts
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
```

- [ ] **Step 3: Write the notes hook**

`src/hooks/useNotes.ts`:
```ts
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Note } from '../lib/types'

export function useNotes(companyId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId) {
      setNotes([])
      setLoading(false)
      return
    }
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
```

- [ ] **Step 4: Write the contacts hook**

`src/hooks/useContacts.ts`:
```ts
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
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/hooks
git commit -m "feat: add data hooks for companies, visits, notes, contacts"
```

---

## Task 11: Targets page

**Files:**
- Create: `src/components/ui/Sheet.tsx`, `src/components/company/CompanyRow.tsx`, `src/components/company/CompanyCard.tsx`, `src/components/company/FilterSheet.tsx`, `src/components/company/CompanyForm.tsx`
- Modify: `src/pages/Targets.tsx` (replace placeholder)

- [ ] **Step 1: Write the sheet primitive**

`src/components/ui/Sheet.tsx`:
```tsx
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, onClose, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="safe-bottom relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--bg)] lg:max-w-lg lg:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)] px-4 py-3">
          <h2 className="text-[16px] font-semibold">{title}</h2>
          <button onClick={onClose} className="min-h-11 px-2 text-[15px] text-[var(--muted)]">
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the expanded profile card**

`src/components/company/CompanyCard.tsx`:
```tsx
import { Link } from 'react-router-dom'
import type { Company } from '../../lib/types'

export function CompanyCard({ company, indent }: { company: Company; indent?: boolean }) {
  return (
    <div className={`pb-4 text-[15px] ${indent ? 'pl-8' : ''}`}>
      {(company.company_type || company.hq) && (
        <p className="mb-2 text-[13px] text-[var(--muted)]">
          {[company.company_type, company.hq].filter(Boolean).join(' · ')}
        </p>
      )}
      {company.bio && <p className="my-1 text-[var(--muted)]">{company.bio}</p>}

      {company.fit && (
        <>
          <h4 className="mt-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-accent-ink)]">
            Why them
          </h4>
          <p className="my-1">{company.fit}</p>
        </>
      )}

      {company.opening_line && (
        <>
          <h4 className="mt-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-accent-ink)]">
            Opening line
          </h4>
          <p className="mt-1 border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2">
            {company.opening_line}
          </p>
        </>
      )}

      {company.asks && company.asks.length > 0 && (
        <>
          <h4 className="mt-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-accent-ink)]">
            Asks
          </h4>
          <ul className="mt-1 list-disc pl-5">
            {company.asks.map((ask) => (
              <li key={ask} className="my-1">
                {ask}
              </li>
            ))}
          </ul>
        </>
      )}

      {company.watch_out && (
        <p className="mt-3 border-l-2 border-[#b3372e] py-1 pl-3">{company.watch_out}</p>
      )}

      {company.who && <p className="mt-3 text-[14px] text-[var(--color-accent-ink)]">{company.who}</p>}

      <Link
        to={`/company/${company.id}`}
        className="mt-4 inline-block text-[14px] font-medium text-[var(--color-accent-ink)] underline"
      >
        Notes & contacts →
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Write the row**

`src/components/company/CompanyRow.tsx`:
```tsx
import { hallForBooths, hallName } from '../../lib/hall'
import type { Company } from '../../lib/types'
import { CompanyCard } from './CompanyCard'

interface Props {
  company: Company
  visited: boolean
  open: boolean
  onToggleOpen: () => void
  onToggleVisited: () => void
}

export function CompanyRow({ company, visited, open, onToggleOpen, onToggleVisited }: Props) {
  return (
    <li className="border-b border-[var(--line)]">
      <div className="flex items-start gap-3 py-3">
        <input
          type="checkbox"
          checked={visited}
          onChange={onToggleVisited}
          aria-label={`Mark ${company.name} visited`}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
        />
        <button onClick={onToggleOpen} className="min-w-0 flex-1 text-left">
          <span
            className={`block text-[15px] font-semibold ${
              visited ? 'text-[var(--muted)] line-through' : ''
            }`}
          >
            {company.name}
          </span>
          <span className="mt-0.5 block text-[13px] text-[var(--muted)]">
            {company.booths.join(' · ')} · {hallName(hallForBooths(company.booths))}
          </span>
          {!open && company.ask && (
            <span className="mt-1 line-clamp-2 block text-[13px] text-[var(--muted)]">{company.ask}</span>
          )}
        </button>
        <span className="pt-1 text-[13px] text-[var(--faint)]">{open ? '−' : '+'}</span>
      </div>
      {open && <CompanyCard company={company} indent />}
    </li>
  )
}
```

- [ ] **Step 4: Write the filter sheet**

`src/components/company/FilterSheet.tsx`:
```tsx
import { HALL_NAMES, type Hall } from '../../lib/hall'
import type { Filters, StatusFilter } from '../../lib/filter'
import { TIER_LABELS, TIER_ORDER, type Tier } from '../../lib/types'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'

interface Props {
  open: boolean
  filters: Filters
  types: string[]
  onChange: (filters: Filters) => void
  onClose: () => void
}

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Not visited' },
  { value: 'visited', label: 'Visited' },
  { value: 'archived', label: 'Archived' },
]

function Group<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onSelect: (value: T) => void
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[13px] text-[var(--muted)]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`min-h-10 rounded-full border px-3 text-[14px] ${
              value === option.value
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                : 'border-[var(--line)] text-[var(--muted)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterSheet({ open, filters, types, onChange, onClose }: Props) {
  return (
    <Sheet open={open} title="Filters" onClose={onClose}>
      <Group<Tier | 'all'>
        label="Tier"
        value={filters.tier}
        options={[
          { value: 'all' as const, label: 'All' },
          ...TIER_ORDER.map((t) => ({ value: t, label: TIER_LABELS[t] })),
        ]}
        onSelect={(tier) => onChange({ ...filters, tier })}
      />
      <Group<Hall | 'all'>
        label="Hall"
        value={filters.hall}
        options={[
          { value: 'all' as const, label: 'All' },
          ...(Object.keys(HALL_NAMES) as Hall[]).map((h) => ({ value: h, label: HALL_NAMES[h] })),
        ]}
        onSelect={(hall) => onChange({ ...filters, hall })}
      />
      <Group<string>
        label="Type"
        value={filters.type}
        options={[{ value: 'all', label: 'All' }, ...types.map((t) => ({ value: t, label: t }))]}
        onSelect={(type) => onChange({ ...filters, type })}
      />
      <Group<StatusFilter>
        label="Status"
        value={filters.status}
        options={STATUSES}
        onSelect={(status) => onChange({ ...filters, status })}
      />
      <Button variant="primary" className="w-full" onClick={onClose}>
        Show results
      </Button>
    </Sheet>
  )
}
```

- [ ] **Step 5: Write the company form**

`src/components/company/CompanyForm.tsx`:
```tsx
import { useState, type FormEvent } from 'react'
import type { Company, Tier } from '../../lib/types'
import { TIER_LABELS, TIER_ORDER } from '../../lib/types'
import { Field, TextArea } from '../ui/Field'
import { Button } from '../ui/Button'

interface Props {
  initial?: Company
  onSubmit: (patch: Partial<Company> & { name: string; tier: Tier }) => Promise<void>
  onCancel: () => void
}

export function CompanyForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [tier, setTier] = useState<Tier>(initial?.tier ?? 'A')
  const [booths, setBooths] = useState(initial?.booths.join(', ') ?? '')
  const [companyType, setCompanyType] = useState(initial?.company_type ?? '')
  const [hq, setHq] = useState(initial?.hq ?? '')
  const [ask, setAsk] = useState(initial?.ask ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        tier,
        booths: booths
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean),
        company_type: companyType.trim() || null,
        hq: hq.trim() || null,
        ask: ask.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Company name" value={name} onChange={(e) => setName(e.target.value)} required />
      <label className="block">
        <span className="mb-1 block text-[13px] text-[var(--muted)]">Tier</span>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as Tier)}
          className="min-h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base"
        >
          {TIER_ORDER.map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Booths (comma separated)"
        value={booths}
        onChange={(e) => setBooths(e.target.value)}
        placeholder="338536, 432212"
        inputMode="numeric"
      />
      <Field label="Type" value={companyType} onChange={(e) => setCompanyType(e.target.value)} placeholder="Importer" />
      <Field label="HQ" value={hq} onChange={(e) => setHq(e.target.value)} placeholder="Schaumburg, IL" />
      <TextArea label="The ask" value={ask} onChange={(e) => setAsk(e.target.value)} rows={3} />
      {error && <p className="text-[14px] text-[#b3372e]">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving} className="flex-1">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 6: Write the page**

Replace `src/pages/Targets.tsx`:
```tsx
import { useMemo, useState } from 'react'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { DEFAULT_FILTERS, activeFilterCount, filterCompanies, type Filters } from '../lib/filter'
import { TIER_NAMES, TIER_ORDER, TIER_SUBS, type Tier } from '../lib/types'
import { CompanyRow } from '../components/company/CompanyRow'
import { FilterSheet } from '../components/company/FilterSheet'
import { CompanyForm } from '../components/company/CompanyForm'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { Empty } from '../components/ui/Empty'

export default function Targets() {
  const { companies, loading, error, reload, create } = useCompanies()
  const { visited, toggle } = useVisits()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const types = useMemo(
    () =>
      Array.from(new Set(companies.map((c) => c.company_type).filter((t): t is string => Boolean(t)))).sort(),
    [companies],
  )

  const visible = useMemo(
    () => filterCompanies(companies, filters, visited),
    [companies, filters, visited],
  )

  const grouped = useMemo(() => {
    const map = new Map<Tier, typeof visible>()
    for (const tier of TIER_ORDER) {
      const rows = visible.filter((c) => c.tier === tier)
      if (rows.length) map.set(tier, rows)
    }
    return map
  }, [visible])

  const filterCount = activeFilterCount(filters)

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Targets</h1>
        <Button onClick={() => setAddOpen(true)} className="min-h-10 px-3 text-[14px]">
          + Add
        </Button>
      </div>

      <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-[var(--line)] bg-[var(--bg)] px-4 pb-3 pt-2">
        <div className="flex gap-2">
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search company, booth, keyword"
            aria-label="Search targets"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base"
          />
          <Button onClick={() => setFiltersOpen(true)} className="shrink-0 px-3 text-[14px]">
            Filters{filterCount ? ` (${filterCount})` : ''}
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[13px] text-[var(--muted)]">
          <span>
            {visible.length} shown · {Object.values(visited).filter(Boolean).length} visited
          </span>
          {(filterCount > 0 || filters.q) && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[var(--color-accent-ink)] underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} onRetry={reload} />
        </div>
      )}
      {loading && <Empty>Loading targets…</Empty>}
      {!loading && visible.length === 0 && <Empty>Nothing matches those filters.</Empty>}

      {Array.from(grouped.entries()).map(([tier, rows]) => (
        <section key={tier} className="mt-6">
          <div className="flex items-baseline gap-2 border-b border-[var(--ink)] pb-1.5">
            <h2 className="text-[17px] font-semibold">{TIER_NAMES[tier]}</h2>
            <span className="text-[13px] text-[var(--muted)]">{TIER_SUBS[tier]}</span>
            <span className="ml-auto text-[13px] text-[var(--faint)]">{rows.length}</span>
          </div>
          <ul className="list-none p-0">
            {rows.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                visited={!!visited[company.id]}
                open={openId === company.id}
                onToggleOpen={() => setOpenId(openId === company.id ? null : company.id)}
                onToggleVisited={() => void toggle(company.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      <FilterSheet
        open={filtersOpen}
        filters={filters}
        types={types}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
      />
      <Sheet open={addOpen} title="Add company" onClose={() => setAddOpen(false)}>
        <CompanyForm
          onSubmit={async (input) => {
            await create(input)
            setAddOpen(false)
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Sheet>
    </div>
  )
}
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/Sheet.tsx src/components/company src/pages/Targets.tsx
git commit -m "feat: add targets list with search, filters, and add-company"
```

---

## Task 12: Company detail page with notes

**Files:**
- Create: `src/components/notes/NoteList.tsx`, `src/components/notes/NoteComposer.tsx`
- Modify: `src/pages/Company.tsx` (replace placeholder)

- [ ] **Step 1: Write the note composer**

`src/components/notes/NoteComposer.tsx`:
```tsx
import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'

export function NoteComposer({ onAdd }: { onAdd: (body: string) => Promise<void> }) {
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      await onAdd(trimmed)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="What did they say?"
        aria-label="New note"
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-base"
      />
      {error && <p className="mt-1 text-[14px] text-[#b3372e]">{error}</p>}
      <Button type="submit" variant="primary" disabled={saving || !body.trim()} className="mt-2 w-full">
        {saving ? 'Saving…' : 'Add note'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Write the note list**

`src/components/notes/NoteList.tsx`:
```tsx
import type { Note } from '../../lib/types'

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function NoteList({ notes, onRemove }: { notes: Note[]; onRemove: (id: string) => void }) {
  if (notes.length === 0) {
    return <p className="py-4 text-[15px] text-[var(--muted)]">No notes yet.</p>
  }
  return (
    <ul className="mt-4 list-none p-0">
      {notes.map((note) => (
        <li key={note.id} className="border-b border-[var(--line)] py-3">
          <p className="whitespace-pre-wrap text-[15px]">{note.body}</p>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-[var(--faint)]">
            <span>{formatStamp(note.created_at)}</span>
            <button onClick={() => onRemove(note.id)} className="underline">
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 3: Write the page**

Replace `src/pages/Company.tsx`:
```tsx
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { useNotes } from '../hooks/useNotes'
import { useContacts } from '../hooks/useContacts'
import { hallForBooths, hallName } from '../lib/hall'
import { CompanyCard } from '../components/company/CompanyCard'
import { CompanyForm } from '../components/company/CompanyForm'
import { NoteComposer } from '../components/notes/NoteComposer'
import { NoteList } from '../components/notes/NoteList'
import { ContactList } from '../components/contacts/ContactList'
import { CardCapture } from '../components/contacts/CardCapture'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'

export default function Company() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { companies, loading, update, remove } = useCompanies()
  const { visited, toggle } = useVisits()
  const { notes, add: addNote, remove: removeNote } = useNotes(id)
  const { contacts, add: addContact, remove: removeContact } = useContacts(id)
  const [editOpen, setEditOpen] = useState(false)
  const [captureOpen, setCaptureOpen] = useState(false)

  const company = companies.find((c) => c.id === id)

  if (loading) return <Empty>Loading…</Empty>
  if (!company) return <Empty>Company not found.</Empty>

  const onDelete = async () => {
    const label = company.is_default
      ? `Archive ${company.name}? Its notes and contacts are kept.`
      : `Delete ${company.name} and all its notes? This cannot be undone.`
    if (!confirm(label)) return
    await remove(company)
    navigate('/targets')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <Link to="/targets" className="text-[14px] text-[var(--muted)]">
        ← Targets
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <p className="mt-1 text-[14px] text-[var(--muted)]">
            {company.booths.join(' · ')} · {hallName(hallForBooths(company.booths))}
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-[14px]">
          <input
            type="checkbox"
            checked={!!visited[company.id]}
            onChange={() => void toggle(company.id)}
            className="h-5 w-5 accent-[var(--color-accent)]"
          />
          Visited
        </label>
      </div>

      {company.archived && (
        <p className="mt-3 rounded-lg bg-[var(--surface)] p-3 text-[14px] text-[var(--muted)]">
          Archived.{' '}
          <button
            onClick={() => void update(company.id, { archived: false })}
            className="text-[var(--color-accent-ink)] underline"
          >
            Restore
          </button>
        </p>
      )}

      <div className="mt-4">
        <CompanyCard company={company} />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setEditOpen(true)} className="flex-1">
          Edit
        </Button>
        <Button variant="danger" onClick={() => void onDelete()} className="flex-1">
          {company.is_default ? 'Archive' : 'Delete'}
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="border-b border-[var(--ink)] pb-1.5 text-[17px] font-semibold">Notes</h2>
        <NoteComposer onAdd={addNote} />
        <NoteList notes={notes} onRemove={(noteId) => void removeNote(noteId)} />
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b border-[var(--ink)] pb-1.5">
          <h2 className="text-[17px] font-semibold">Contacts</h2>
          <Button onClick={() => setCaptureOpen(true)} variant="primary" className="min-h-10 px-3 text-[14px]">
            + Card
          </Button>
        </div>
        <ContactList contacts={contacts} onRemove={(contactId) => void removeContact(contactId)} />
      </section>

      <Sheet open={editOpen} title="Edit company" onClose={() => setEditOpen(false)}>
        <CompanyForm
          initial={company}
          onSubmit={async (patch) => {
            await update(company.id, patch)
            setEditOpen(false)
          }}
          onCancel={() => setEditOpen(false)}
        />
      </Sheet>

      <CardCapture
        open={captureOpen}
        companyId={company.id}
        defaultCompanyName={company.name}
        onSave={async (input) => {
          await addContact(input)
          setCaptureOpen(false)
        }}
        onClose={() => setCaptureOpen(false)}
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit (build is verified after Task 13 adds the contact components)**

```bash
git add src/components/notes src/pages/Company.tsx
git commit -m "feat: add company detail page with notes"
```

---

## Task 13: Card capture with OCR

**Files:**
- Create: `api/ocr.ts`, `src/lib/image.ts`, `src/components/contacts/ContactForm.tsx`, `src/components/contacts/ContactList.tsx`, `src/components/contacts/CardCapture.tsx`, `vercel.json`

- [ ] **Step 1: Write the serverless OCR function**

`api/ocr.ts`:
```ts
// Vercel serverless function: business card image URL -> parsed fields.
// Requires OPENAI_API_KEY. Never called with the key client-side.

const PROMPT = `Extract contact details from this business card image.
Return ONLY a JSON object with these exact keys: name, title, company, email, phone.
Use null for any field not present on the card. Do not guess or invent values.`

export const config = { runtime: 'nodejs' }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'OCR is not configured' }, { status: 501 })
  }

  let imageUrl: string
  try {
    const body = (await request.json()) as { imageUrl?: string }
    if (!body.imageUrl) throw new Error('imageUrl is required')
    imageUrl = body.imageUrl
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('OpenAI error', response.status, detail)
      return Response.json({ error: 'Could not read the card' }, { status: 502 })
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = payload.choices?.[0]?.message?.content
    if (!content) return Response.json({ error: 'Empty response' }, { status: 502 })

    const parsed = JSON.parse(content) as Record<string, unknown>
    return Response.json({
      name: parsed.name ?? null,
      title: parsed.title ?? null,
      company: parsed.company ?? null,
      email: parsed.email ?? null,
      phone: parsed.phone ?? null,
    })
  } catch (error) {
    console.error('OCR failed', error)
    return Response.json({ error: 'Could not read the card' }, { status: 502 })
  }
}
```

`vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Write the client-side image resize**

`src/lib/image.ts`:
```ts
const MAX_EDGE = 1600
const QUALITY = 0.8

// Show wifi is slow and OCR bills by pixels: shrink before upload.
export async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', QUALITY)
  })
}
```

- [ ] **Step 3: Write the contact form**

`src/components/contacts/ContactForm.tsx`:
```tsx
import { useState, type FormEvent } from 'react'
import type { ContactDraft } from '../../lib/ocrMerge'
import { Field, TextArea } from '../ui/Field'
import { Button } from '../ui/Button'

interface Props {
  draft: ContactDraft
  onChange: (draft: ContactDraft) => void
  onSubmit: () => Promise<void>
  onCancel: () => void
  busy?: boolean
}

export function ContactForm({ draft, onChange, onSubmit, onCancel, busy }: Props) {
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.name.trim() && !draft.email.trim() && !draft.phone.trim()) {
      setError('Add at least a name, email, or phone.')
      return
    }
    setError(null)
    await onSubmit()
  }

  const set = (key: keyof ContactDraft) => (value: string) => onChange({ ...draft, [key]: value })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Name" value={draft.name} onChange={(e) => set('name')(e.target.value)} autoComplete="name" />
      <Field label="Title" value={draft.title} onChange={(e) => set('title')(e.target.value)} />
      <Field label="Company" value={draft.company_name} onChange={(e) => set('company_name')(e.target.value)} />
      <Field
        label="Email"
        type="email"
        inputMode="email"
        value={draft.email}
        onChange={(e) => set('email')(e.target.value)}
      />
      <Field
        label="Phone"
        type="tel"
        inputMode="tel"
        value={draft.phone}
        onChange={(e) => set('phone')(e.target.value)}
      />
      <TextArea label="Notes" rows={3} value={draft.notes} onChange={(e) => set('notes')(e.target.value)} />
      {error && <p className="text-[14px] text-[#b3372e]">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy} className="flex-1">
          {busy ? 'Saving…' : 'Save contact'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Write the contact list**

`src/components/contacts/ContactList.tsx`:
```tsx
import type { Contact } from '../../lib/types'

export function ContactList({
  contacts,
  onRemove,
}: {
  contacts: Contact[]
  onRemove: (id: string) => void
}) {
  if (contacts.length === 0) {
    return <p className="py-4 text-[15px] text-[var(--muted)]">No contacts yet.</p>
  }
  return (
    <ul className="mt-2 list-none p-0">
      {contacts.map((contact) => (
        <li key={contact.id} className="flex gap-3 border-b border-[var(--line)] py-3">
          {contact.card_image_url && (
            <img
              src={contact.card_image_url}
              alt=""
              className="h-14 w-20 shrink-0 rounded border border-[var(--line)] object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold">{contact.name || 'Unnamed'}</div>
            {(contact.title || contact.company_name) && (
              <div className="text-[13px] text-[var(--muted)]">
                {[contact.title, contact.company_name].filter(Boolean).join(' · ')}
              </div>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="block text-[14px] text-[var(--color-accent-ink)]">
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="block text-[14px] text-[var(--color-accent-ink)]">
                {contact.phone}
              </a>
            )}
            {contact.notes && <p className="mt-1 text-[14px]">{contact.notes}</p>}
          </div>
          <button
            onClick={() => onRemove(contact.id)}
            className="shrink-0 self-start text-[13px] text-[var(--faint)] underline"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 5: Write the capture flow**

`src/components/contacts/CardCapture.tsx`:
```tsx
import { useRef, useState, type ChangeEvent } from 'react'
import { supabase, CARDS_BUCKET } from '../../lib/supabase'
import { resizeImage } from '../../lib/image'
import { EMPTY_DRAFT, mergeOcr, type ContactDraft } from '../../lib/ocrMerge'
import type { Contact, OcrResult } from '../../lib/types'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { ContactForm } from './ContactForm'

interface Props {
  open: boolean
  companyId: string | null
  defaultCompanyName?: string
  onSave: (input: Partial<Contact>) => Promise<void>
  onClose: () => void
}

export function CardCapture({ open, companyId, defaultCompanyName, onSave, onClose }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<ContactDraft>({
    ...EMPTY_DRAFT,
    company_name: defaultCompanyName ?? '',
  })
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [rawOcr, setRawOcr] = useState<OcrResult | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setDraft({ ...EMPTY_DRAFT, company_name: defaultCompanyName ?? '' })
    setImageUrl(null)
    setRawOcr(null)
    setStatus(null)
  }

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setStatus('Uploading…')
    try {
      const blob = await resizeImage(file)
      const path = `${crypto.randomUUID()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from(CARDS_BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg' })
      if (uploadError) throw new Error(uploadError.message)

      const { data } = supabase.storage.from(CARDS_BUCKET).getPublicUrl(path)
      setImageUrl(data.publicUrl)

      setStatus('Reading card…')
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: data.publicUrl }),
      })

      if (!response.ok) {
        setStatus("Couldn't read the card — enter the details manually.")
        return
      }

      const ocr = (await response.json()) as OcrResult
      setRawOcr(ocr)
      setDraft((prev) => mergeOcr(prev, ocr))
      setStatus(null)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    setBusy(true)
    try {
      await onSave({
        company_id: companyId,
        name: draft.name.trim() || null,
        title: draft.title.trim() || null,
        company_name: draft.company_name.trim() || null,
        email: draft.email.trim() || null,
        phone: draft.phone.trim() || null,
        notes: draft.notes.trim() || null,
        card_image_url: imageUrl,
        raw_ocr: rawOcr,
      })
      reset()
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    reset()
    onClose()
  }

  return (
    <Sheet open={open} title="Add contact" onClose={close}>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => void onFile(e)}
        className="hidden"
      />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Business card"
          className="mb-4 w-full rounded-lg border border-[var(--line)]"
        />
      ) : (
        <Button
          variant="primary"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="mb-4 w-full"
        >
          Photograph card
        </Button>
      )}

      {status && <p className="mb-3 text-[14px] text-[var(--muted)]">{status}</p>}

      <ContactForm
        draft={draft}
        onChange={setDraft}
        onSubmit={save}
        onCancel={close}
        busy={busy}
      />
    </Sheet>
  )
}
```

- [ ] **Step 6: Verify the build and the full test suite**

Run: `npm run build && npx vitest run`
Expected: build exits 0; 26 tests pass across 4 files.

- [ ] **Step 7: Commit**

```bash
git add api/ocr.ts vercel.json src/lib/image.ts src/components/contacts
git commit -m "feat: capture business cards with OCR prefill"
```

---

## Task 14: Contacts page

**Files:**
- Modify: `src/pages/Contacts.tsx` (replace placeholder)

- [ ] **Step 1: Write the page**

Replace `src/pages/Contacts.tsx`:
```tsx
import { useMemo, useState } from 'react'
import { useContacts } from '../hooks/useContacts'
import { useCompanies } from '../hooks/useCompanies'
import { contactsToCsv, downloadCsv } from '../lib/csv'
import { ContactList } from '../components/contacts/ContactList'
import { CardCapture } from '../components/contacts/CardCapture'
import { Button } from '../components/ui/Button'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { Empty } from '../components/ui/Empty'

export default function Contacts() {
  const { contacts, loading, error, reload, add, remove } = useContacts()
  const { companies } = useCompanies()
  const [q, setQ] = useState('')
  const [captureOpen, setCaptureOpen] = useState(false)

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return contacts
    return contacts.filter((contact) =>
      [contact.name, contact.title, contact.company_name, contact.email, contact.phone, contact.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [contacts, q])

  const companyName = (id: string | null) =>
    id ? (companies.find((c) => c.id === id)?.name ?? null) : null

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <Button onClick={() => setCaptureOpen(true)} variant="primary" className="min-h-10 px-3 text-[14px]">
          + Card
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search contacts"
          aria-label="Search contacts"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-base"
        />
        <Button
          onClick={() => downloadCsv('imts-2026-contacts.csv', contactsToCsv(contacts))}
          disabled={contacts.length === 0}
          className="shrink-0 px-3 text-[14px]"
        >
          CSV
        </Button>
      </div>

      <p className="mt-2 text-[13px] text-[var(--muted)]">
        {visible.length} of {contacts.length}
      </p>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} onRetry={reload} />
        </div>
      )}
      {loading && <Empty>Loading contacts…</Empty>}
      {!loading && contacts.length === 0 && <Empty>No cards captured yet.</Empty>}
      {!loading && contacts.length > 0 && visible.length === 0 && (
        <Empty>No contacts match “{q.trim()}”.</Empty>
      )}

      {visible.length > 0 && (
        <ContactList
          contacts={visible.map((c) => ({
            ...c,
            company_name: c.company_name ?? companyName(c.company_id),
          }))}
          onRemove={(id) => void remove(id)}
        />
      )}

      <CardCapture
        open={captureOpen}
        companyId={null}
        onSave={async (input) => {
          await add(input)
          setCaptureOpen(false)
        }}
        onClose={() => setCaptureOpen(false)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Contacts.tsx
git commit -m "feat: add contacts page with search and CSV export"
```

---

## Task 15: Floor map

The legacy map draws four hall rects in an 800×540 viewBox and places pins from booth digits. Hall rects, copied verbatim from `RECT` in the legacy file: `W {x:40,y:70,w:260,h:420}`, `N {x:340,y:70,w:220,h:170}`, `S {x:340,y:270,w:220,h:220}`, `E {x:600,y:70,w:160,h:420}`.

**Files:**
- Create: `src/content/map.ts`, `src/components/map/PanZoom.tsx`, `src/components/map/FloorMap.tsx`
- Modify: `src/pages/MapPage.tsx` (replace placeholder)

- [ ] **Step 1: Write the map constants and pin placement**

`src/content/map.ts`:
```ts
import type { Hall } from '../lib/hall'

export interface HallRect {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub: string
}

export const VIEWBOX = { width: 800, height: 540 }

export const HALL_RECTS: Record<Hall, HallRect> = {
  W: { x: 40, y: 70, w: 260, h: 420, label: 'West · L3', sub: 'Tooling & Workholding · 9:00–17:00 · 43xxxx' },
  N: { x: 340, y: 70, w: 220, h: 170, label: 'North · L3', sub: 'Automation · 10:00–18:00 · 23xxxx' },
  S: { x: 340, y: 270, w: 220, h: 220, label: 'South · L3', sub: 'Metal Removal · 10:00–18:00 · 33xxxx' },
  E: { x: 600, y: 70, w: 160, h: 420, label: 'East · L3', sub: 'Software · QA · 9–17' },
}

// Booth numbers encode aisle and position. Spread pins across each hall rect by
// those digits so relative placement is meaningful; exact position is not surveyed.
export function pinPosition(booth: string, hall: Hall, index: number, total: number): { x: number; y: number } {
  const rect = HALL_RECTS[hall]
  const digits = booth.replace(/\D/g, '')
  const aisle = Number(digits.slice(1, 3) || '0')
  const spot = Number(digits.slice(3) || '0')

  const padX = 34
  const padY = 46
  const usableW = rect.w - padX * 2
  const usableH = rect.h - padY * 2

  // Aisle drives the horizontal band, spot drives depth; index breaks ties so
  // two booths in the same aisle never render exactly on top of each other.
  const xRatio = (aisle % 20) / 20
  const yRatio = (spot % 1000) / 1000
  const jitter = total > 1 ? ((index % 5) - 2) * 4 : 0

  return {
    x: rect.x + padX + xRatio * usableW + jitter,
    y: rect.y + padY + yRatio * usableH,
  }
}
```

- [ ] **Step 2: Write the pan/zoom wrapper**

`src/components/map/PanZoom.tsx`:
```tsx
import { useRef, useState, type PointerEvent, type ReactNode, type WheelEvent } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 5

export function PanZoom({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null)
  const panStart = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null)

  const distance = () => {
    const [a, b] = Array.from(pointers.current.values())
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) {
      pinchStart.current = { distance: distance(), scale }
      panStart.current = null
    } else if (pointers.current.size === 1) {
      panStart.current = { x: event.clientX, y: event.clientY, offset }
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.current.size === 2 && pinchStart.current) {
      const next = (distance() / pinchStart.current.distance) * pinchStart.current.scale
      setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)))
    } else if (pointers.current.size === 1 && panStart.current && scale > 1) {
      setOffset({
        x: panStart.current.offset.x + (event.clientX - panStart.current.x),
        y: panStart.current.offset.y + (event.clientY - panStart.current.y),
      })
    }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinchStart.current = null
    if (pointers.current.size === 0) panStart.current = null
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return
    event.preventDefault()
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev - event.deltaY * 0.01)))
  }

  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="relative">
      <div
        className="touch-none overflow-hidden rounded-lg border border-[var(--line)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {children}
        </div>
      </div>
      {scale > 1 && (
        <button
          onClick={reset}
          className="absolute right-2 top-2 min-h-9 rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 text-[13px]"
        >
          Reset
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write the map**

`src/components/map/FloorMap.tsx`:
```tsx
import { hallForBooths, type Hall } from '../../lib/hall'
import type { Company } from '../../lib/types'
import { HALL_RECTS, VIEWBOX, pinPosition } from '../../content/map'

interface Props {
  companies: Company[]
  visited: Record<string, boolean>
  selectedId: string | null
  hallFilter: Hall | null
  onSelect: (id: string) => void
  onSelectHall: (hall: Hall | null) => void
}

export function FloorMap({
  companies,
  visited,
  selectedId,
  hallFilter,
  onSelect,
  onSelectHall,
}: Props) {
  const placed = companies
    .map((company) => {
      const hall = hallForBooths(company.booths)
      if (!hall) return null
      return { company, hall, booth: company.booths[0] }
    })
    .filter((entry): entry is { company: Company; hall: Hall; booth: string } => entry !== null)

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      className="block h-auto w-full bg-[var(--bg)]"
      role="img"
      aria-label="Schematic map of McCormick Place with target booths"
    >
      {(Object.keys(HALL_RECTS) as Hall[]).map((hall) => {
        const rect = HALL_RECTS[hall]
        const active = hallFilter === hall
        return (
          <g key={hall} onClick={() => onSelectHall(active ? null : hall)} className="cursor-pointer">
            <rect
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              rx={4}
              fill={active ? 'var(--color-accent-soft)' : 'var(--surface)'}
              stroke="var(--line)"
            />
            <text x={rect.x + 12} y={rect.y + 22} className="fill-[var(--ink)] text-[16px] font-semibold">
              {rect.label}
            </text>
            <text x={rect.x + 12} y={rect.y + 38} className="fill-[var(--muted)] text-[11px]">
              {rect.sub}
            </text>
          </g>
        )
      })}

      {placed.map((entry, index) => {
        const { x, y } = pinPosition(entry.booth, entry.hall, index, placed.length)
        const isVisited = !!visited[entry.company.id]
        const isSelected = selectedId === entry.company.id
        const dimmed = hallFilter !== null && hallFilter !== entry.hall
        return (
          <g
            key={entry.company.id}
            onClick={() => onSelect(entry.company.id)}
            className="cursor-pointer"
            opacity={dimmed ? 0.15 : 1}
            pointerEvents={dimmed ? 'none' : 'auto'}
          >
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 9 : 6}
              fill={isVisited ? 'var(--color-accent)' : 'var(--bg)'}
              stroke="var(--color-accent)"
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
          </g>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 4: Write the page**

Replace `src/pages/MapPage.tsx`:
```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCompanies } from '../hooks/useCompanies'
import { useVisits } from '../hooks/useVisits'
import { HALL_NAMES, hallForBooths, type Hall } from '../lib/hall'
import { FloorMap } from '../components/map/FloorMap'
import { PanZoom } from '../components/map/PanZoom'
import { Sheet } from '../components/ui/Sheet'
import { Button } from '../components/ui/Button'

export default function MapPage() {
  const { companies } = useCompanies()
  const { visited, toggle } = useVisits()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hallFilter, setHallFilter] = useState<Hall | null>(null)

  const active = companies.filter((c) => !c.archived)
  const selected = active.find((c) => c.id === selectedId) ?? null

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="text-2xl font-semibold">Map</h1>
      <p className="mt-1 text-[14px] text-[var(--muted)]">
        Tap a hall to filter, tap a pin for the ask. Pin positions come from booth numbering, so they are
        relative, not surveyed. Confirm on the{' '}
        <a
          href="https://directory.imts.com/8_0/explore/floorplan.cfm"
          rel="noopener"
          className="text-[var(--color-accent-ink)] underline"
        >
          official floor plan
        </a>{' '}
        before you walk.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() => setHallFilter(null)}
          className={`min-h-10 px-3 text-[14px] ${hallFilter === null ? 'border-[var(--color-accent)] text-[var(--color-accent-ink)]' : ''}`}
        >
          All halls
        </Button>
        {(Object.keys(HALL_NAMES) as Hall[]).map((hall) => (
          <Button
            key={hall}
            onClick={() => setHallFilter(hallFilter === hall ? null : hall)}
            className={`min-h-10 px-3 text-[14px] ${hallFilter === hall ? 'border-[var(--color-accent)] text-[var(--color-accent-ink)]' : ''}`}
          >
            {HALL_NAMES[hall]}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        <PanZoom>
          <FloorMap
            companies={active}
            visited={visited}
            selectedId={selectedId}
            hallFilter={hallFilter}
            onSelect={setSelectedId}
            onSelectHall={setHallFilter}
          />
        </PanZoom>
      </div>

      <ul className="mt-4 list-none border-t border-[var(--line)] p-0">
        {active
          .filter((c) => !hallFilter || hallForBooths(c.booths) === hallFilter)
          .map((company) => (
            <li
              key={company.id}
              onClick={() => setSelectedId(company.id)}
              className="flex cursor-pointer items-baseline gap-3 border-b border-[var(--line)] py-2.5 text-[14px]"
            >
              <span className="min-w-16 font-semibold">{company.booths[0]}</span>
              <span className={`flex-1 ${visited[company.id] ? 'text-[var(--muted)] line-through' : ''}`}>
                {company.name}
              </span>
            </li>
          ))}
      </ul>

      <Sheet open={!!selected} title={selected?.name ?? ''} onClose={() => setSelectedId(null)}>
        {selected && (
          <div className="text-[15px]">
            <p className="text-[var(--muted)]">
              {selected.booths.join(' · ')} · {HALL_NAMES[hallForBooths(selected.booths) ?? 'W']}
            </p>
            {selected.ask && <p className="mt-3">{selected.ask}</p>}
            <label className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!visited[selected.id]}
                onChange={() => void toggle(selected.id)}
                className="h-5 w-5 accent-[var(--color-accent)]"
              />
              Visited
            </label>
            <Link
              to={`/company/${selected.id}`}
              className="mt-4 inline-block text-[14px] font-medium text-[var(--color-accent-ink)] underline"
            >
              Notes & contacts →
            </Link>
          </div>
        )}
      </Sheet>
    </div>
  )
}
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/content/map.ts src/components/map src/pages/MapPage.tsx
git commit -m "feat: add pinch-zoom floor map with booth pins"
```

---

## Task 16: Playbook content pages

Port the prose sections from the legacy HTML verbatim. Read the source file for each section's exact text — do not paraphrase or summarize.

**Files:**
- Create: `src/content/thesis.tsx`, `src/content/numbers.tsx`, `src/content/rules.tsx`, `src/content/days.tsx`, `src/content/scripts.tsx`, `src/content/plays.tsx`, `src/content/followup.tsx`
- Modify: `src/pages/Playbook.tsx` (replace placeholder)

- [ ] **Step 1: Read each source section**

Run:
```bash
sed -n '232,241p' hippsc-imts-2026-playbook.html   # thesis
sed -n '291,304p' hippsc-imts-2026-playbook.html   # numbers
sed -n '305,328p' hippsc-imts-2026-playbook.html   # rules
sed -n '365,416p' hippsc-imts-2026-playbook.html   # days
sed -n '417,446p' hippsc-imts-2026-playbook.html   # scripts
sed -n '447,481p' hippsc-imts-2026-playbook.html   # plays
sed -n '482,493p' hippsc-imts-2026-playbook.html   # followup
```

- [ ] **Step 2: Port each section to a component**

Each file exports a default component holding that section's content as JSX, preserving every sentence. Pattern, using the real thesis text:

`src/content/thesis.tsx`:
```tsx
export default function Thesis() {
  return (
    <div className="border-l-2 border-[var(--color-accent)] pl-4">
      <p className="my-2 text-[19px] leading-relaxed">
        <strong>We are walkers, not exhibitors.</strong> Six days, two people, 1,752 booths. The job is not to be
        seen by everyone. It is to have 40–60 real conversations, walk out with 10 hot leads, open 3 channel or
        OEM talks, and get one piece of press.
      </p>
      <p className="my-2">
        <strong>Every competitor and every Chinese holder maker is in one hall.</strong> West Building, Level 3:
        Haimer, BIG Daishowa, Zoller, Schunk, Kennametal, Rego-Fix, MST, the Chinese cluster at 4312xx–4313xx,
        the CMTBA booth. West opens at 9:00 and closes at 17:00, one hour ahead of South and North. Use that
        hour.
      </p>
      <p className="my-2">
        <strong>We are not the cheap option, so don't sell cheap.</strong> Our site lists CAT40 shrink fit from
        $248.85 and HSK63A from $275.50. Maritool, made in Illinois, sells a CAT40 1/2" shrink holder for
        $196.30, same day. A China-origin holder carries roughly 41% stacked duty today, versus about 15% for
        Taiwan. The wedges are the system: the $6,785 U7 Pro shrink machine bundled with holders (Techniks and
        Haimer machines run $10K–$35K), custom gauge lengths and slim profiles in weeks not months, presetting
        without a subscription, private-label supply to US brands and distributors.
      </p>
      <p className="my-2">
        <strong>The best deals this week are with people who don't have booths either.</strong> Dealers (Ellison,
        Productivity, Morris, Hartwig, Gosiger) staff OEM booths in South. Techniks, Lyndex-Nikken, Maritool and
        Command are not exhibiting; their people walk the floor as attendees. Read badges.
      </p>
    </div>
  )
}
```

Apply the same treatment to the remaining six files, keeping the legacy structure: `numbers.tsx` renders the key/value rows (a `<dl>`-style two-column grid), `rules.tsx` renders the Fine / Not fine two-column lists, `days.tsx` renders one block per day with time-slot rows, `scripts.tsx` renders each labeled script plus the objection table, `plays.tsx` renders the named plays, `followup.tsx` renders the follow-up cadence. Every sentence from the source must appear.

- [ ] **Step 3: Write the page with collapsible sections**

Replace `src/pages/Playbook.tsx`:
```tsx
import { useState, type ReactNode } from 'react'
import Thesis from '../content/thesis'
import Numbers from '../content/numbers'
import Rules from '../content/rules'
import Days from '../content/days'
import Scripts from '../content/scripts'
import Plays from '../content/plays'
import Followup from '../content/followup'

const SECTIONS: { id: string; title: string; body: ReactNode; openByDefault?: boolean }[] = [
  { id: 'thesis', title: 'The thesis', body: <Thesis />, openByDefault: true },
  { id: 'numbers', title: 'Numbers to carry', body: <Numbers /> },
  { id: 'rules', title: 'Rules of the game', body: <Rules /> },
  { id: 'days', title: 'Day by day', body: <Days /> },
  { id: 'scripts', title: 'Scripts', body: <Scripts /> },
  { id: 'plays', title: 'Plays', body: <Plays /> },
  { id: 'followup', title: 'Follow-up', body: <Followup /> },
]

function Section({ title, body, openByDefault }: { title: string; body: ReactNode; openByDefault?: boolean }) {
  const [open, setOpen] = useState(!!openByDefault)
  return (
    <section className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between border-b border-[var(--ink)] pb-2 text-left"
      >
        <h2 className="text-[22px] font-semibold">{title}</h2>
        <span className="text-[var(--faint)]">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-3">{body}</div>}
    </section>
  )
}

export default function Playbook() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-ink)]">
        HIPPSC · IMTS 2026
      </p>
      <h1 className="mt-1 text-[clamp(30px,7vw,42px)] font-semibold leading-tight tracking-tight">
        Field Playbook
      </h1>
      <p className="mt-2 text-[14px] text-[var(--muted)]">
        McCormick Place, Chicago · September 14–19, 2026
      </p>

      {SECTIONS.map((section) => (
        <Section
          key={section.id}
          title={section.title}
          body={section.body}
          openByDefault={section.openByDefault}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Verify every section rendered**

Run: `npm run build`
Expected: exit code 0.

Then confirm no section is a stub:
```bash
wc -l src/content/*.tsx
```
Expected: each of the seven files is more than 15 lines. A file near-empty means content was dropped — go back to Step 2.

- [ ] **Step 5: Commit**

```bash
git add src/content src/pages/Playbook.tsx
git commit -m "feat: port playbook prose into React content sections"
```

---

## Task 17: Deployment setup and verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run the full verification suite**

Run:
```bash
npx tsc -b && npx vitest run && npm run build
```
Expected: typecheck clean; 26 tests pass; build exits 0.

- [ ] **Step 2: Write the README**

`README.md`:
```markdown
# HIPPSC IMTS 2026 Field Playbook

Mobile-first field app for working the IMTS 2026 floor: playbook, target list,
visit tracking, notes, and business-card capture with OCR.

## Setup

1. **Supabase** — create a project, then in the SQL editor run:
   - `supabase/schema.sql`
   - `supabase/seed.sql`

2. **Environment** — copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL` — project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — publishable key (`sb_publishable_…`),
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

## Regenerating seed data

`node scripts/extract.mjs` re-reads `hippsc-imts-2026-playbook.html` and
rewrites `supabase/seed.sql`. The seed uses `on conflict do nothing`, so
re-running it in Supabase never overwrites edits made in the app.

## Security note

The passcode is checked client-side and the Supabase publishable key ships in the
bundle with permissive RLS policies. Anyone with the URL and the passcode has
full read/write access. This is a private single-user tool; do not share the
link publicly or put anything sensitive in it.

## Tests

`npm test` — covers hall derivation, company filtering, CSV export, and the
OCR prefill merge.
```

- [ ] **Step 3: Verify mobile rendering at 375px**

Start the dev server, then in the browser tool set the viewport to 375×812 and check each route:
- `/` — sections collapse and expand, no horizontal scroll
- `/targets` — search and Filters reachable with a thumb, rows expand
- `/map` — pinch-zoom works, tapping a pin opens the sheet
- `/company/<any id>` — note saves, card sheet opens
- `/contacts` — list and CSV button render

Expected: no horizontal overflow on any route; the bottom tab bar stays visible and clears the home indicator.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add setup, deploy, and security notes"
```

---

## Verification checklist

Before calling this done, confirm each with actual command output:

- [ ] `npx tsc -b` exits 0
- [ ] `npx vitest run` — 26 tests pass across 4 files
- [ ] `npm run build` exits 0
- [ ] `grep -c "^  ('" supabase/seed.sql` returns 88
- [ ] Each of the 7 files in `src/content/*.tsx` is more than 15 lines
- [ ] All five routes render at 375px with no horizontal scroll
