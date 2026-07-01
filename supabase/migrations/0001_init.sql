-- Verso — initial schema + Row Level Security.
-- Run once in the Supabase SQL editor (or via `supabase db push`).
--
-- Catalog tables (spots/neighborhoods/geheimtipp) are publicly READABLE by the
-- anon/publishable key; nobody can write them from the client. `profiles` is
-- private per user. Localized text is kept (blurb_de, teaser_de, spots.de jsonb).

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists neighborhoods (
  city     text not null,
  name     text not null,
  blurb    text not null,
  blurb_de text,
  primary key (city, name)
);

create table if not exists spots (
  id            text primary key,
  name          text not null,
  category      text not null,
  city          text not null,
  neighborhood  text not null,
  hook          text not null,
  image_note    text not null,
  description   text not null,
  tags          text[] not null default '{}',
  price_level   int  not null,
  address       text not null,
  ambience      text[] not null default '{}',
  rating        numeric not null,
  lat           double precision not null,
  lng           double precision not null,
  tone          text not null,
  reserve_url   text,
  hours         jsonb,           -- { open, close }
  date_label    text,            -- events only
  meeting_point text,            -- events only
  ticket_url    text,            -- events only
  de            jsonb            -- German variant { name?, hook, description, tags, imageNote }
);

create table if not exists geheimtipp_by_city (
  city       text primary key,
  spot_id    text not null,
  week_label text not null,
  teaser     text not null,
  teaser_de  text
);

create table if not exists profiles (
  id             uuid primary key references auth.users on delete cascade,
  name           text,
  username       text,
  bio            text,
  saved_spot_ids text[] not null default '{}',
  interests      text[] not null default '{}',
  created_at     timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table neighborhoods       enable row level security;
alter table spots               enable row level security;
alter table geheimtipp_by_city  enable row level security;
alter table profiles            enable row level security;

-- Public read for the catalog (anon + authenticated). No client writes.
drop policy if exists "read neighborhoods" on neighborhoods;
create policy "read neighborhoods" on neighborhoods for select using (true);

drop policy if exists "read spots" on spots;
create policy "read spots" on spots for select using (true);

drop policy if exists "read geheimtipp" on geheimtipp_by_city;
create policy "read geheimtipp" on geheimtipp_by_city for select using (true);

-- Each user manages only their own profile row.
drop policy if exists "own profile select" on profiles;
create policy "own profile select" on profiles for select using (auth.uid() = id);

drop policy if exists "own profile insert" on profiles;
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);

drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id);
