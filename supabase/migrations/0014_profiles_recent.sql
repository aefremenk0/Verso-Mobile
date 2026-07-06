-- Verso 0014 — per-account "recently viewed" spots.
-- Run once in the Supabase SQL editor.
--
-- Was device-local (AsyncStorage, shared across accounts on the same device).
-- Moving it onto the profile makes it per-user: it follows the account and a
-- fresh account starts empty. Same shape as saved_spot_ids / interests.

alter table profiles
  add column if not exists recent_spot_ids text[] not null default '{}';
