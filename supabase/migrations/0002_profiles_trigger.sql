-- Verso — auto-create a profile row for every new auth user.
-- Run once in the Supabase SQL editor after 0001_init.sql.
--
-- When someone signs up (Supabase Auth writes to auth.users), this trigger
-- inserts a matching row into public.profiles so the app always has a profile to
-- read/write. `security definer` lets the function bypass RLS for that insert.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
