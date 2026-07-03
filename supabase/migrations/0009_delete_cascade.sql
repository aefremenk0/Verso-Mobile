-- Verso — complete account deletion (GDPR Art. 17 "right to erasure").
-- Run once in the Supabase SQL editor after the earlier migrations.
--
-- The old delete_user() only removed the auth.users row (profiles cascade). That
-- left the user's AVATAR file in Storage, their ANALYTICS rows and their SPOT
-- SUGGESTIONS behind. This version wipes all of it in one transaction.
--
-- NOTE (can't be done in SQL): the RevenueCat customer must be deleted via the
-- RevenueCat API/dashboard (or a server job) — do that in the deletion pipeline.

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return; -- not signed in, nothing to delete
  end if;

  -- 1) Avatar file(s) in the public "avatars" bucket (stored under "<uid>/…").
  delete from storage.objects
   where bucket_id = 'avatars'
     and name like uid::text || '/%';

  -- 2) First-party analytics rows tied to this user (if the table exists).
  if to_regclass('public.analytics_events') is not null then
    delete from public.analytics_events where user_id = uid;
  end if;

  -- 3) This user's place suggestions (remove content, not just the link).
  if to_regclass('public.spot_suggestions') is not null then
    delete from public.spot_suggestions where user_id = uid;
  end if;

  -- 4) Finally the auth user itself — profiles cascade-delete via their FK.
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
