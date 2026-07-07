-- Verso 0017 — public Storage bucket for spot images.
-- Run once in the Supabase SQL editor. Re-runnable.
--
-- Editorial content: images are publicly READABLE, but only the service role /
-- dashboard may upload/replace/delete (no client write policy). Files are keyed
-- by spot id, e.g. "muc-kellerkind.jpg", so the app can derive the URL from id.

-- Public bucket for spot images.
insert into storage.buckets (id, name, public)
values ('spot-images', 'spot-images', true)
on conflict (id) do nothing;

-- Anyone may READ spot images (public bucket).
drop policy if exists "spot-images public read" on storage.objects;
create policy "spot-images public read" on storage.objects
  for select using (bucket_id = 'spot-images');

-- DELIBERATELY no insert/update/delete policy: only the service role / dashboard
-- can write here (admin-managed content), never a normal user via the anon key.
