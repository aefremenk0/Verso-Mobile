-- Verso — place suggestions + account deletion.
-- Run once in the Supabase SQL editor after the earlier migrations.

-- ── Place suggestions ("Ort vorschlagen") ────────────────────────────────────
create table if not exists spot_suggestions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete set null,
  name       text not null,
  category   text,
  area       text,
  note       text,
  city       text,
  created_at timestamptz not null default now()
);

alter table spot_suggestions enable row level security;

-- Anyone (signed-in or guest) may submit; nobody can read them from the client
-- (only via the dashboard / an admin role) -> no select policy.
drop policy if exists "suggestions insert" on spot_suggestions;
create policy "suggestions insert" on spot_suggestions
  for insert with check (true);

-- ── Account deletion ─────────────────────────────────────────────────────────
-- Lets a signed-in user delete their own auth account (profiles cascade-delete).
-- security definer so it can touch auth.users; only the caller's own row.
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
