-- Verso 0010 — protect the Insider status columns from self-service escalation.
-- Run once in the Supabase SQL editor.
--
-- Security: the `profiles` UPDATE policy allows a user to update their own row,
-- which includes `is_insider` / `insider_expires_at`. Those must ONLY be set by
-- the RevenueCat webhook (service role). This trigger resets any change to those
-- columns unless the caller is the service role, so a user can't grant themselves
-- Insider by writing to their own profile row via the REST API.

create or replace function public.protect_insider_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.is_insider := old.is_insider;
    new.insider_expires_at := old.insider_expires_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_insider on profiles;
create trigger protect_insider
  before update on profiles
  for each row execute function public.protect_insider_columns();
