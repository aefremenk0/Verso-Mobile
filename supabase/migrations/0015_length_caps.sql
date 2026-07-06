-- Verso 0015 — length caps on user-supplied text (defense against abuse/bloat).
-- Run once in the Supabase SQL editor. Re-runnable (drop-if-exists then add).
--
-- The client also enforces matching maxLength on the inputs; these CHECKs are the
-- server-side backstop for anything that skips the UI (crafted REST calls).

-- profiles: name / username / bio
alter table profiles drop constraint if exists profiles_name_len;
alter table profiles add constraint profiles_name_len
  check (name is null or char_length(name) <= 80);

alter table profiles drop constraint if exists profiles_username_len;
alter table profiles add constraint profiles_username_len
  check (username is null or char_length(username) <= 40);

alter table profiles drop constraint if exists profiles_bio_len;
alter table profiles add constraint profiles_bio_len
  check (bio is null or char_length(bio) <= 300);

-- spot_suggestions: name / area / note / category / city
alter table spot_suggestions drop constraint if exists suggestions_name_len;
alter table spot_suggestions add constraint suggestions_name_len
  check (char_length(name) <= 120);

alter table spot_suggestions drop constraint if exists suggestions_area_len;
alter table spot_suggestions add constraint suggestions_area_len
  check (area is null or char_length(area) <= 120);

alter table spot_suggestions drop constraint if exists suggestions_note_len;
alter table spot_suggestions add constraint suggestions_note_len
  check (note is null or char_length(note) <= 1000);

alter table spot_suggestions drop constraint if exists suggestions_category_len;
alter table spot_suggestions add constraint suggestions_category_len
  check (category is null or char_length(category) <= 40);

alter table spot_suggestions drop constraint if exists suggestions_city_len;
alter table spot_suggestions add constraint suggestions_city_len
  check (city is null or char_length(city) <= 80);

-- analytics_events: cap event name + total props payload size (no giant blobs).
alter table analytics_events drop constraint if exists analytics_name_len;
alter table analytics_events add constraint analytics_name_len
  check (char_length(name) <= 120);

alter table analytics_events drop constraint if exists analytics_props_size;
alter table analytics_events add constraint analytics_props_size
  check (octet_length(props::text) <= 4096);
