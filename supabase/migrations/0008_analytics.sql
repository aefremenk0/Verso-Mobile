-- Verso — first-party analytics + crash events (fed by src/lib/analytics.ts).
-- Run once in the Supabase SQL editor after the earlier migrations.
--
-- Privacy by design: clients may INSERT events but never SELECT them back, and
-- events carry no PII (only event names, an opaque user id, whitelisted props).

create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('track', 'error')),
  name text not null,
  props jsonb not null default '{}'::jsonb,
  user_id uuid,
  ts timestamptz not null default now(),
  inserted_at timestamptz not null default now()
);

create index if not exists analytics_events_name_idx on analytics_events (name);
create index if not exists analytics_events_ts_idx on analytics_events (ts);

alter table analytics_events enable row level security;

-- Anyone (incl. anonymous/guest) may write an event...
drop policy if exists "insert analytics" on analytics_events;
create policy "insert analytics" on analytics_events
  for insert
  with check (true);

-- ...but NO client may read them back (only the service role / SQL editor can).
-- (No select policy => select is denied under RLS.)
