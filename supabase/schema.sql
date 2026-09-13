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
  website       text,
  name_zh          text,
  company_type_zh  text,
  ask_zh           text,
  bio_zh           text,
  fit_zh           text,
  opening_line_zh  text,
  asks_zh          text[],
  watch_out_zh     text,
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
