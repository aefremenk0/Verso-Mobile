-- Verso — server-side Insider status (fed by the RevenueCat webhook).
-- Run once in the Supabase SQL editor after the earlier migrations.
--
-- The RevenueCat webhook (supabase/functions/revenuecat-webhook) writes these
-- columns so the DATABASE knows who's a paying Insider — needed to protect
-- premium content server-side (the client alone can't be trusted for that).

alter table profiles
  add column if not exists is_insider boolean not null default false;

alter table profiles
  add column if not exists insider_expires_at timestamptz;

-- ── Example: Insider-only spots ("verborgene Ebene") ─────────────────────────
-- When you add hidden spots, gate them with a column + RLS that trusts the
-- server-set flag. Uncomment when needed:
--
-- alter table spots add column if not exists insider_only boolean not null default false;
--
-- drop policy if exists "read spots" on spots;
-- create policy "read spots" on spots for select using (
--   not insider_only
--   or exists (
--     select 1 from profiles p
--     where p.id = auth.uid() and p.is_insider
--   )
-- );
