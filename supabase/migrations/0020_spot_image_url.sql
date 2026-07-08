-- Verso 0020 — real photo URL per spot.
-- Run once in the Supabase SQL editor. Re-runnable.
--
-- The app shows spots.image_url as the photo (expo-image, cover). Null/empty ->
-- the tone-colored placeholder (so you can add photos gradually, nothing breaks).
-- Convention: upload files to the public `spot-images` bucket keyed by spot id
-- (e.g. "muc-kellerkind.jpg") and set image_url to that file's public URL:
--   https://nzdhnfkoegzcjpkkmbmm.supabase.co/storage/v1/object/public/spot-images/<id>.jpg

alter table spots
  add column if not exists image_url text;
