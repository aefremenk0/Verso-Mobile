-- Verso — persist the collected weekly hidden-gem per user.
-- Run once in the Supabase SQL editor after 0001_init.sql / 0002_*.sql.
--
-- Stores the list of cities whose "hidden gem of the week" the user has already
-- revealed (e.g. {"München"}). The app derives the per-city "collected" flag
-- from membership in this array.

alter table profiles
  add column if not exists geheimtipp_abgeholt text[] not null default '{}';
