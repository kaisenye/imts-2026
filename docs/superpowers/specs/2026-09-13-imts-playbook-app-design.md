# HIPPSC IMTS 2026 Field Playbook — Full-Stack App

**Date:** 2026-09-13
**Status:** Approved design

## Problem

`hippsc-imts-2026-playbook.html` is a 1,421-line single-file static playbook: floor map, 88 target companies with profiles/asks/opening lines, day schedule, scripts, plays, follow-up. State is a single localStorage key of visited checkboxes. Nothing persists across devices, nothing can be added, and no notes or contacts can be captured.

The rep works the floor on a phone for six days. They need the playbook plus a real database behind it.

## Goals

1. Same playbook content, readable on a phone.
2. Persist visited state, notes, and contacts to a database.
3. Capture business cards by photo with OCR auto-fill.
4. Add / update / delete companies beyond the 88 seeded defaults.
5. Deploy on Vercel, data on Supabase.

## Non-goals

- Multi-user accounts, roles, per-rep attribution (single user).
- Editing playbook prose (scripts, rules, days, plays) through the UI.
- Offline-first sync. Online-only; the show has wifi.
- Real security. A shared passcode gate, not auth.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v4
- React Router v6
- `@supabase/supabase-js` (Postgres + Storage)
- Vercel: static build + one serverless function (`/api/ocr`)

## Access control

Shared passcode. `VITE_APP_PASSCODE` compared client-side; on success set `localStorage.hippsc_auth`. A `<PasscodeGate>` wraps the router.

Supabase uses the publishable key (sb_publishable_…, the anon role) with RLS enabled and permissive policies (`true` for select/insert/update/delete on all four tables, and on the `cards` storage bucket). This is explicitly not security — it keeps casual visitors out of a private tool. If the URL leaks, the data is readable. Accepted.

## Data model

### `companies`
| column | type | notes |
|---|---|---|
| id | text PK | slug, e.g. `yamazen` |
| name | text not null | |
| tier | text not null | `A` \| `B` \| `C` \| `D` \| `M` |
| booths | text[] | e.g. `{338536}` |
| company_type | text | Distributor, Importer, Dealer, … |
| hq | text | |
| ask | text | one-line summary from `TARGETS[].a` |
| who | text | named contacts from `TARGETS[].w` |
| bio | text | from `INFO[].bio` |
| fit | text | from `INFO[].fit` |
| opening_line | text | from `INFO[].op` |
| asks | text[] | from `INFO[].ak` |
| watch_out | text | from `INFO[].wa` |
| is_default | boolean default false | true for the 88 seeded |
| archived | boolean default false | soft delete |
| created_at | timestamptz default now() | |

Hall is derived from the first booth digit (`1→E, 2→N, 3→S, 4→W`), matching the existing `HALL` map. Not stored.

### `visits`
| column | type |
|---|---|
| company_id | text PK references companies(id) on delete cascade |
| visited | boolean default false |
| visited_at | timestamptz |

### `notes`
| column | type |
|---|---|
| id | uuid PK default gen_random_uuid() |
| company_id | text references companies(id) on delete cascade |
| body | text not null |
| created_at | timestamptz default now() |

### `contacts`
| column | type |
|---|---|
| id | uuid PK default gen_random_uuid() |
| company_id | text references companies(id) on delete set null |
| name | text |
| title | text |
| company_name | text | free text, for cards whose company isn't in the DB |
| email | text |
| phone | text |
| notes | text |
| card_image_url | text |
| raw_ocr | jsonb |
| created_at | timestamptz default now() |

Indexes: `notes(company_id)`, `contacts(company_id)`, `companies(tier)`, `companies(archived)`.

### Storage
Bucket `cards`, public read, path `cards/<uuid>.jpg`.

## Delete semantics

- `is_default = true` → delete sets `archived = true`. The row stays so a re-seed can't resurrect it and its notes/contacts survive.
- `is_default = false` → hard delete, cascading notes and visits.
- An "Archived" filter in the targets view restores archived defaults.

## Content migration

A one-time Node script (`scripts/extract.mjs`) parses the existing HTML, merges `TARGETS` + `INFO`, and emits:
- `supabase/seed.sql` — 88 `insert … on conflict do nothing` rows.
- `src/content/*.tsx` — the static prose sections (thesis, numbers, rules, days, scripts, plays, follow-up) as React components, hand-cleaned after generation.
- `src/content/map.ts` — hall rects, booth→hall map, pin placement constants.

Nothing from the HTML is dropped. The original file stays in the repo for reference.

## Routes

| route | purpose |
|---|---|
| `/` | Playbook — thesis, numbers, rules, days, scripts, plays, follow-up. Collapsible sections. |
| `/map` | SVG floor map, pins from DB, pinch-zoom, tap pin → bottom sheet. |
| `/targets` | Hit list: search, filter (tier/type/hall/status), expandable cards, visited toggle, add company. |
| `/company/:id` | Detail: full profile, notes thread, contacts, camera FAB, edit/delete. |
| `/contacts` | All captured contacts, searchable, CSV export. |

## Card capture flow

1. Camera button on `/company/:id` (and a standalone one on `/contacts`) → `<input type="file" accept="image/*" capture="environment">`.
2. Client resizes the image to max 1600px on the long edge, JPEG q0.8 (keeps upload fast on show wifi and OCR cost down).
3. Upload to Supabase Storage `cards/<uuid>.jpg`, get public URL.
4. `POST /api/ocr { imageUrl }` → Vercel function → OpenAI `gpt-4o-mini` vision with a JSON-mode prompt → `{ name, title, company, email, phone }`.
5. Prefill the contact form, rep confirms/edits, save to `contacts` with `card_image_url` and `raw_ocr`.

If `OPENAI_API_KEY` is unset or the call fails, the form opens empty with the photo attached and a "couldn't read card, enter manually" line. Card capture never hard-fails on OCR.

`/api/ocr` reads `OPENAI_API_KEY` from Vercel env. Never exposed client-side.

## Mobile-first design

Breakpoint: phone is the default, `lg:` (1024px) adds the desktop sidebar. Target 375px width.

- **Nav:** fixed bottom tab bar (Playbook / Map / Targets / Contacts), 56px tall + safe-area inset. Sidebar replaces it at `lg:`.
- **Tap targets:** 44px minimum everywhere.
- **Inputs:** 16px font minimum so iOS doesn't zoom on focus.
- **Filters:** bottom sheet on phone, inline selects at `lg:`.
- **Forms:** full-screen sheets, one field per row, sticky save bar above the keyboard.
- **Map:** pinch-zoom + pan wrapper over the SVG (currently a fixed viewBox, unusable on a phone). Tap pin → bottom sheet detail.
- **Playbook:** single column, collapsible `<section>`s so 1,400 lines of prose isn't one scroll.
- **Safe areas:** `env(safe-area-inset-*)` on the tab bar and sticky bars.

## Visual style

OpenAI/Linear minimalist:
- Neutral grayscale base; the existing green (`#1B7F4B`) retained as the single accent, used sparingly (active nav, visited state, primary button).
- Inter, `font-variant-numeric: tabular-nums`.
- 1px hairline borders, no drop shadows (except sheets/overlays).
- Compact density, generous line-height on prose.
- Dark mode via `prefers-color-scheme` with CSS custom properties.

## Architecture

```
src/
  main.tsx, App.tsx            router + PasscodeGate
  lib/supabase.ts              client
  lib/hall.ts                  booth → hall derivation
  hooks/useCompanies.ts        list, filter, mutate
  hooks/useNotes.ts
  hooks/useContacts.ts
  components/
    nav/BottomTabs.tsx, Sidebar.tsx
    ui/Sheet.tsx, Field.tsx, Button.tsx, Empty.tsx
    company/CompanyRow.tsx, CompanyCard.tsx, CompanyForm.tsx
    notes/NoteList.tsx, NoteComposer.tsx
    contacts/ContactForm.tsx, ContactList.tsx, CardCapture.tsx
    map/FloorMap.tsx, MapPin.tsx, PanZoom.tsx
  content/                     static playbook prose
  pages/Playbook, Map, Targets, Company, Contacts
api/ocr.ts                     Vercel serverless
supabase/schema.sql, seed.sql
scripts/extract.mjs
```

Each hook owns one table. Components take data as props and stay presentational except the page-level containers.

## Error handling

- Supabase errors surface as an inline banner with a retry, never a blank screen.
- Mutations are optimistic for the visited toggle (instant feedback on a laggy show connection), rolled back on error.
- Notes and contacts save pessimistically with a spinner — losing a note is worse than a 300ms wait.
- OCR failure degrades to manual entry, as above.

## Testing

- Vitest + React Testing Library for `lib/hall.ts` (booth→hall derivation), filter logic, and the contact form's OCR-prefill merge.
- Manual verification pass at 375px in the browser tool before calling it done: nav, add company, add note, card capture with a stub image, map pan/zoom.
- No E2E suite. The app is a six-day single-user tool; the cost isn't justified.

## Deployment

1. Supabase project → run `schema.sql` then `seed.sql`.
2. Vercel project from the repo.
3. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_APP_PASSCODE` (build-time), `OPENAI_API_KEY` (server-only).

## Open risks

- The passcode is client-side and the publishable key is in the bundle. Anyone with the URL and passcode has full write access. Acceptable for a private single-user tool; not acceptable if this is ever shared publicly.
- Pin positions in the original are derived from booth numbering, not surveyed. Carried over as-is with the same "confirm on the official floor plan" caveat.
