-- Verso — notification preferences + push token per user.
-- Run once in the Supabase SQL editor after the earlier migrations.
--
-- `notify` holds which notification types the user enabled
-- (e.g. {"geheimtipp","spots"}). `push_token` is the Expo push token used by a
-- future backend / edge function to send "new spots" / "events" notifications.

alter table profiles
  add column if not exists notify text[] not null default '{}';

alter table profiles
  add column if not exists push_token text;
