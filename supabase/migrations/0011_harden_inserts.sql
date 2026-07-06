-- Verso 0011 — bind inserts to the caller's own identity.
-- Run once in the Supabase SQL editor.
--
-- Security: `spot_suggestions` and `analytics_events` previously allowed inserts
-- with check (true) — anyone could write rows attributed to ANY user_id. This
-- restricts inserts so a row's user_id must be null (guest) or the caller's own
-- uid, so nobody can forge suggestions/events in another user's name. Guest
-- inserts (no user_id, e.g. pre-login analytics) stay allowed.

drop policy if exists "suggestions insert" on spot_suggestions;
create policy "suggestions insert" on spot_suggestions
  for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists "insert analytics" on analytics_events;
create policy "insert analytics" on analytics_events
  for insert with check (user_id is null or user_id = auth.uid());
