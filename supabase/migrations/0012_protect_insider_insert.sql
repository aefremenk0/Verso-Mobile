-- Verso 0012 — close the Insider-escalation gap on the INSERT path.
-- Run once in the Supabase SQL editor (after 0010).
--
-- Security: 0010 added a BEFORE UPDATE trigger that resets is_insider /
-- insider_expires_at for non-service-role callers, so a user can't grant
-- themselves Insider by UPDATING their own profile row. But the profiles
-- INSERT policy ("own profile insert", with check auth.uid() = id) authorizes a
-- user to insert their OWN row with ANY column values — including
-- is_insider = true — and the trigger did NOT fire on INSERT. Normally the
-- handle_new_user() trigger (0002) pre-creates the row, so a client INSERT hits
-- a PK conflict and fails; but relying on "the row always pre-exists" is fragile
-- for a privilege-granting column (a row provisioned via the Admin API / import
-- that bypasses 0002, or a deleted-then-recreated row, would let a plain
-- `insert into profiles (id, is_insider) values (auth.uid(), true)` succeed).
--
-- Fix: extend the guard to INSERT too. On INSERT there is no `old` row, so a
-- non-service-role caller's Insider columns are forced to the safe default.

create or replace function public.protect_insider_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    if tg_op = 'INSERT' then
      -- No prior row to preserve — force the safe default.
      new.is_insider := false;
      new.insider_expires_at := null;
    else
      -- Preserve whatever the service role (webhook) last set.
      new.is_insider := old.is_insider;
      new.insider_expires_at := old.insider_expires_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_insider on public.profiles;
create trigger protect_insider
  before insert or update on public.profiles
  for each row execute function public.protect_insider_columns();
