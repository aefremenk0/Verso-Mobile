-- Verso 0019 — backend-controlled city unlock ("scharf stellen").
-- Run once in the Supabase SQL editor. Re-runnable.
--
-- Which cities are selectable was hardcoded (LIVE_CITIES in the app). This table
-- moves the LIVE flag to the DB: flip `is_live` and the app picks it up on next
-- launch — no app-store update. The city LIST + labels stay in code (typed
-- union); only the unlock status is dynamic. The app falls back to the code
-- constant if this table is missing/empty, so nothing breaks before it's run.
--
-- IMPORTANT: a city needs CONTENT (spots + neighborhoods for that city) in the
-- DB before you flip it live, otherwise its feed is empty.

create table if not exists cities (
  name       text primary key,   -- canonical German name (matches the app's City)
  is_live    boolean not null default false,
  sort_order int not null default 0
);

alter table cities enable row level security;

-- Public read (like the catalog). No client write policy -> only the service
-- role / dashboard flips cities live.
drop policy if exists "read cities" on cities;
create policy "read cities" on cities for select using (true);

-- Seed all cities; only Munich is live (matches the current pilot).
insert into cities (name, is_live, sort_order) values
  ('München',    true,  1),
  ('Wien',       false, 2),
  ('Zürich',     false, 3),
  ('Berlin',     false, 4),
  ('Hamburg',    false, 5),
  ('Frankfurt',  false, 6),
  ('Düsseldorf', false, 7)
on conflict (name) do nothing;
