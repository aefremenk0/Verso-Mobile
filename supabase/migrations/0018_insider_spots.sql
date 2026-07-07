-- Verso 0018 — Insider-only spots ("verborgene Ebene").
-- Run once in the Supabase SQL editor. Re-runnable.
--
-- A hidden layer of spots visible ONLY to paying Insiders. Security is enforced
-- SERVER-SIDE via RLS (a client filter alone would leak the rows, since `spots`
-- is publicly readable). The policy trusts `profiles.is_insider`, which is set
-- by the RevenueCat webhook — the server's source of truth for who paid.

-- 1) The flag (default false = visible to everyone, as today).
alter table spots
  add column if not exists insider_only boolean not null default false;

-- 2) Read policy: everyone sees normal spots; Insider-only spots are returned
--    only to a signed-in user whose profile is flagged is_insider.
drop policy if exists "read spots" on spots;
create policy "read spots" on spots for select using (
  not insider_only
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.is_insider
  )
);
