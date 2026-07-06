-- Verso 0013 — populate profiles.name / profiles.username from sign-up metadata.
-- Run once in the Supabase SQL editor (replaces the 0002 function body).
--
-- With email confirmation ON, there is no session right after signUp, so the
-- client can't write the chosen name/username into `profiles` yet. Instead the
-- app passes them as auth user metadata (options.data on signUp), and this
-- trigger copies them into the profile row the moment the auth user is created —
-- so the name is there as soon as the user confirms and signs in.
--
-- Only replaces the FUNCTION; the on_auth_user_created trigger from 0002 stays.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'username', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
