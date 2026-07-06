-- Verso — komplettes Backend-Setup in einem Rutsch (GENERIERT).
-- Reihenfolge: alle Migrationen 0001–00xx in Nummernfolge, dann Seed.
-- WICHTIG: bei jeder NEUEN Migration diese Datei neu generieren
--          (concat der supabase/migrations/*.sql + seed.sql).
-- Alternativ direkt die nummerierten Migrationen einzeln ausführen.


-- ============================================================ 0001
-- Verso — initial schema + Row Level Security.
-- Run once in the Supabase SQL editor (or via `supabase db push`).
--
-- Catalog tables (spots/neighborhoods/geheimtipp) are publicly READABLE by the
-- anon/publishable key; nobody can write them from the client. `profiles` is
-- private per user. Localized text is kept (blurb_de, teaser_de, spots.de jsonb).

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists neighborhoods (
  city     text not null,
  name     text not null,
  blurb    text not null,
  blurb_de text,
  primary key (city, name)
);

create table if not exists spots (
  id            text primary key,
  name          text not null,
  category      text not null,
  city          text not null,
  neighborhood  text not null,
  hook          text not null,
  image_note    text not null,
  description   text not null,
  tags          text[] not null default '{}',
  price_level   int  not null,
  address       text not null,
  ambience      text[] not null default '{}',
  rating        numeric not null,
  lat           double precision not null,
  lng           double precision not null,
  tone          text not null,
  reserve_url   text,
  hours         jsonb,           -- { open, close }
  date_label    text,            -- events only
  meeting_point text,            -- events only
  ticket_url    text,            -- events only
  de            jsonb            -- German variant { name?, hook, description, tags, imageNote }
);

create table if not exists geheimtipp_by_city (
  city       text primary key,
  spot_id    text not null,
  week_label text not null,
  teaser     text not null,
  teaser_de  text
);

create table if not exists profiles (
  id             uuid primary key references auth.users on delete cascade,
  name           text,
  username       text,
  bio            text,
  saved_spot_ids text[] not null default '{}',
  interests      text[] not null default '{}',
  created_at     timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table neighborhoods       enable row level security;
alter table spots               enable row level security;
alter table geheimtipp_by_city  enable row level security;
alter table profiles            enable row level security;

-- Public read for the catalog (anon + authenticated). No client writes.
drop policy if exists "read neighborhoods" on neighborhoods;
create policy "read neighborhoods" on neighborhoods for select using (true);

drop policy if exists "read spots" on spots;
create policy "read spots" on spots for select using (true);

drop policy if exists "read geheimtipp" on geheimtipp_by_city;
create policy "read geheimtipp" on geheimtipp_by_city for select using (true);

-- Each user manages only their own profile row.
drop policy if exists "own profile select" on profiles;
create policy "own profile select" on profiles for select using (auth.uid() = id);

drop policy if exists "own profile insert" on profiles;
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);

drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- ============================================================ 0002
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

-- ============================================================ 0003
-- Verso — persist the collected weekly hidden-gem per user.
-- Run once in the Supabase SQL editor after 0001_init.sql / 0002_*.sql.
--
-- Stores the list of cities whose "hidden gem of the week" the user has already
-- revealed (e.g. {"München"}). The app derives the per-city "collected" flag
-- from membership in this array.

alter table profiles
  add column if not exists geheimtipp_abgeholt text[] not null default '{}';

-- ============================================================ 0004
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

-- ============================================================ 0005
-- Verso — avatar image support.
-- Run once in the Supabase SQL editor after the earlier migrations.
--
-- Adds profiles.avatar_url and a public "avatars" Storage bucket. Anyone can
-- READ avatars (public bucket); each user may only write files under their own
-- <uid>/ folder.

alter table profiles
  add column if not exists avatar_url text;

-- Public bucket for avatars.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read of avatar objects.
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

-- A user may upload/replace only files under their own uid folder.
drop policy if exists "avatars user insert" on storage.objects;
create policy "avatars user insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars user update" on storage.objects;
create policy "avatars user update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars user delete" on storage.objects;
create policy "avatars user delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================ 0006
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

-- ============================================================ 0007
-- Verso — server-side Insider status (fed by the RevenueCat webhook).
-- Run once in the Supabase SQL editor after the earlier migrations.
--
-- The RevenueCat webhook (supabase/functions/revenuecat-webhook) writes these
-- columns so the DATABASE knows who's a paying Insider — needed to protect
-- premium content server-side (the client alone can't be trusted for that).

alter table profiles
  add column if not exists is_insider boolean not null default false;

alter table profiles
  add column if not exists insider_expires_at timestamptz;

-- ── Example: Insider-only spots ("verborgene Ebene") ─────────────────────────
-- When you add hidden spots, gate them with a column + RLS that trusts the
-- server-set flag. Uncomment when needed:
--
-- alter table spots add column if not exists insider_only boolean not null default false;
--
-- drop policy if exists "read spots" on spots;
-- create policy "read spots" on spots for select using (
--   not insider_only
--   or exists (
--     select 1 from profiles p
--     where p.id = auth.uid() and p.is_insider
--   )
-- );

-- ============================================================ 0008
-- Verso — first-party analytics + crash events (fed by src/lib/analytics.ts).
-- Run once in the Supabase SQL editor after the earlier migrations.
--
-- Privacy by design: clients may INSERT events but never SELECT them back, and
-- events carry no PII (only event names, an opaque user id, whitelisted props).

create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('track', 'error')),
  name text not null,
  props jsonb not null default '{}'::jsonb,
  user_id uuid,
  ts timestamptz not null default now(),
  inserted_at timestamptz not null default now()
);

create index if not exists analytics_events_name_idx on analytics_events (name);
create index if not exists analytics_events_ts_idx on analytics_events (ts);

alter table analytics_events enable row level security;

-- Anyone (incl. anonymous/guest) may write an event...
drop policy if exists "insert analytics" on analytics_events;
create policy "insert analytics" on analytics_events
  for insert
  with check (true);

-- ...but NO client may read them back (only the service role / SQL editor can).
-- (No select policy => select is denied under RLS.)

-- ============================================================ 0009
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
set search_path = ''
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

-- ============================================================ 0010
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

-- ============================================================ 0011
-- Verso 0011 — bind inserts to the caller's own identity.
-- Run once in the Supabase SQL editor.
--
-- Security: `spot_suggestions` and `analytics_events` previously allowed inserts
-- with check (true) — anyone could write rows attributed to ANY user_id. This
-- restricts inserts so a row's user_id must be null (guest) or the caller's own
-- uid, so nobody can forge suggestions/events in another user's name. Guest
-- inserts (no user_id, e.g. pre-login analytics) stay allowed.

drop policy if exists "suggestions insert" on spot_suggestions;
create policy "suggestions insert" on spot_suggestions
  for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists "insert analytics" on analytics_events;
create policy "insert analytics" on analytics_events
  for insert with check (user_id is null or user_id = auth.uid());

-- ============================================================ 0012
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

-- ============================================================ 0013
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

-- ============================================================ 0014
-- Verso 0014 — per-account "recently viewed" spots.
-- Run once in the Supabase SQL editor.
--
-- Was device-local (AsyncStorage, shared across accounts on the same device).
-- Moving it onto the profile makes it per-user: it follows the account and a
-- fresh account starts empty. Same shape as saved_spot_ids / interests.

alter table profiles
  add column if not exists recent_spot_ids text[] not null default '{}';

-- ============================================================ SEED
-- GENERATED by scripts/gen-seed.ts — do not edit by hand.
-- Run after 0001_init.sql (Supabase SQL editor bypasses RLS).

insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Glockenbachviertel','Munich''s most wide-awake nights — queer, with no curfew in mind.','Münchens wachste Nächte — queer, ohne Sperrstunde im Kopf.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;
insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Gärtnerplatzviertel','Brunch at the roundabout that slides into the next negroni.','Brunch am Rondell, der in den nächsten Negroni übergeht.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;
insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Maxvorstadt','Between the Pinakothek and the pub, student-relaxed.','Zwischen Pinakothek und Kneipe, studentisch entspannt.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;
insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Schwabing','Bohemia in retirement, still wide awake.','Boheme im Ruhestand, immer noch wach.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;
insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Isarvorstadt / Flaucher','In summer the city''s living room — on the gravel riverbank.','Im Sommer das Wohnzimmer der Stadt — am Kiesufer.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;
insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Werksviertel','Where the concrete dances: clubs, rooftops, a Ferris wheel.','Wo der Beton tanzt: Clubs, Rooftops, ein Riesenrad.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;
insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Westend / Schwanthalerhöhe','A multicultural block with the tables nobody talks about.','Multikulti-Block mit den Tischen, von denen keiner spricht.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;
insert into neighborhoods (city,name,blurb,blurb_de) values ('München','Haidhausen','The French Quarter, quiet pride.','Franzosenviertel, leiser Stolz.') on conflict (city,name) do update set blurb=excluded.blurb, blurb_de=excluded.blurb_de;

insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('glasscherbe','Glasscherbe','cafe','München','Glockenbachviertel','Cortado between antiquarian books and ashtray.','// books, smoke, calm','Half antiquarian bookshop, half café, entirely out of time. A cortado, a yellowed book, a seat by the window. Nobody bothers you, nobody rushes you.',array['Cortado','Books','Quiet']::text[],2,'Klenzestraße 41, 80469 München',array['gemütlich','intim']::text[],4.5,48.1283,11.5743,'brown',null,null,null,null,null,'{"hook":"Cortado zwischen Antiquariat und Aschenbecher.","description":"Halb Antiquariat, halb Café, ganz aus der Zeit gefallen. Cortado, ein vergilbtes Buch, ein Platz am Fenster. Niemand stört, niemand drängt.","tags":["Cortado","Bücher","Ruhig"],"imageNote":"// bücher, rauch, ruhe"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('kellerkind','Kellerkind','bar','München','Glockenbachviertel','Down the stairs, door shut, phone away.','// no signal, on purpose','A cellar bar where phones stay at the coat check. Dimmed light, honest drinks, conversations that run longer because nobody is staring at a screen.',array['Cocktails','Intimate','Late']::text[],2,'Hans-Sachs-Straße 7, 80469 München',array['intim','underground']::text[],4.7,48.1304,11.5712,'charcoal',null,null,null,null,null,'{"hook":"Treppe runter, Tür zu, Telefon weg.","description":"Eine Kellerbar, in der Handys an der Garderobe bleiben. Gedämpftes Licht, ehrliche Drinks, Gespräche, die länger werden, weil keiner aufs Display schaut.","tags":["Cocktails","Intim","Spät"],"imageNote":"// kein netz, mit absicht"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('muc-gaertnerei','Gärtnerei','cafe','München','Gärtnerplatzviertel','Brunch on the roundabout, until the first spritz arrives.','// long table, late spritz','A bright corner spot on Gärtnerplatz where brunch flows seamlessly into the aperitivo. Sourdough, poached eggs, and at some point a spritz stands on the table instead of coffee.',array['Brunch','Sourdough','Spritz']::text[],2,'Reichenbachstraße 12, 80469 München',array['lebhaft','gemütlich']::text[],4.5,48.1308,11.5764,'green',null,null,null,null,null,'{"hook":"Brunch am Rondell, bis der erste Spritz kommt.","description":"Ein heller Eckladen am Gärtnerplatz, in dem der Brunch nahtlos in den Aperitivo übergeht. Sauerteig, pochierte Eier, und irgendwann steht statt Kaffee ein Spritz auf dem Tisch.","tags":["Brunch","Sauerteig","Spritz"],"imageNote":"// langer tisch, später spritz"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('foehnsturm','Föhnsturm','bar','München','Maxvorstadt','Negroni by an open window, when the wind is right.','// windows open during föhn','A small bar that throws the windows open during föhn weather and lets the city in. A negroni, a record player, the bartender picks the side himself.',array['Negroni','Vinyl']::text[],2,'Augustenstraße 28, 80333 München',array['lebhaft','intim']::text[],4.5,48.1487,11.5651,'charcoal',null,null,null,null,null,'{"hook":"Negroni bei offenem Fenster, wenn der Wind passt.","description":"Eine kleine Bar, die bei Föhn die Fenster aufreißt und die Stadt reinlässt. Negroni, ein Plattenspieler, der Barchef sucht selbst die Seite aus.","tags":["Negroni","Vinyl"],"imageNote":"// fenster auf bei föhn"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('lichthof-muc','Lichthof','cafe','München','Maxvorstadt','Glass roof, cappuccino, students with novels.','// light from above','A glazed courtyard between two old buildings, where the light falls from above. Cappuccino, thick novels, the quiet turning of pages. The university is near, the calm even nearer.',array['Cappuccino','Bright','Quiet']::text[],2,'Türkenstraße 58, 80799 München',array['gemütlich','elegant']::text[],4.4,48.1512,11.5772,'green',null,null,null,null,null,'{"hook":"Glasdach, Cappuccino, Studenten mit Romanen.","description":"Ein verglaster Innenhof zwischen zwei Altbauten, in dem das Licht von oben fällt. Cappuccino, dicke Romane, das leise Blättern von Seiten. Die Uni ist nah, die Ruhe näher.","tags":["Cappuccino","Hell","Ruhig"],"imageNote":"// licht von oben"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('muc-leopold','Leopold & Sohn','bar','München','Schwabing','Negroni, a stone''s throw from the Englischer Garten.','// by the garden, after work','A narrow bar in a Schwabing side street, close enough to the Englischer Garten to walk home barefoot afterwards. Classic drinks, no frills, a host with a memory.',array['Negroni','Classic','Late']::text[],2,'Feilitzschstraße 9, 80802 München',array['lebhaft','intim']::text[],4.5,48.1622,11.5862,'brown',null,null,null,null,null,'{"hook":"Negroni, einen Steinwurf vom Englischen Garten.","description":"Eine schmale Bar in einer Schwabinger Seitenstraße, nah genug am Englischen Garten, um danach barfuß heimzugehen. Klassische Drinks, kein Schnickschnack, ein Wirt mit Gedächtnis.","tags":["Negroni","Klassisch","Spät"],"imageNote":"// vor dem garten, nach der arbeit"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('isarliebe','Isarliebe','restaurant','München','Haidhausen','A tavern from the outside, fine dining from within.','// roast pork, but different','Regulars'' table and deer antlers outside, inside a kitchen that takes every classic apart and rebuilds it. The roast pork arrives, but not the way you think.',array['Bavarian','Modern']::text[],3,'Wörthstraße 6, 81667 München',array['gemütlich','elegant']::text[],4.6,48.1289,11.5942,'green','https://www.opentable.de/',null,null,null,null,'{"hook":"Wirtshaus von außen, Feinkost von innen.","description":"Außen Stammtisch und Hirschgeweih, innen eine Küche, die jeden Klassiker zerlegt und neu baut. Der Schweinsbraten kommt, aber nicht so, wie du denkst.","tags":["Bayrisch","Modern"],"imageNote":"// schweinsbraten, aber anders"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('weisswurst-um-zehn','White Sausage at Ten','snack','München','Isarvorstadt / Flaucher','Before noon, standing up, with a pretzel.','// never after midday','A butcher''s shop with standing tables, where by old custom the white sausage never hears the noon bells. Sweet mustard, fresh pretzels, a wheat beer on the side — done.',array['White Sausage','Bavarian','Cheap']::text[],1,'Ohlmüllerstraße 5, 81541 München',array['lebhaft']::text[],4.5,48.1235,11.5798,'brown',null,null,null,null,null,'{"name":"Weißwurst um Zehn","hook":"Vor zwölf, im Stehen, mit Brezn.","description":"Eine Metzgerei mit Stehtischen, an denen die Weißwurst nach altem Gesetz nie das Mittagsläuten hört. Süßer Senf, frische Brezn, ein Weißbier dazu — fertig.","tags":["Weißwurst","Bayrisch","Günstig"],"imageNote":"// nie nach mittag"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('muc-westendkueche','Westendküche','restaurant','München','Westend / Schwanthalerhöhe','Multicultural block, one table nobody talks about.','// menu? whatever was fresh','In the less touristy Westend a small team cooks all across the Mediterranean, depending on what the market offered. Ten tables, long evenings, fair prices.',array['Mediterranean','Seasonal','Multicultural']::text[],2,'Gollierstraße 24, 80339 München',array['lebhaft','gemütlich']::text[],4.6,48.1361,11.5392,'brown','https://www.opentable.de/',null,null,null,null,'{"hook":"Multikulti-Block, ein Tisch, von dem keiner spricht.","description":"Im weniger touristischen Westend kocht ein kleines Team quer durch den Mittelmeerraum, je nachdem, was der Markt hergab. Zehn Tische, lange Abende, faire Preise.","tags":["Mediterran","Saisonal","Multikulti"],"imageNote":"// karte? was frisch war"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('tramklub','Tramklub','club','München','Werksviertel','Old depot, new sound system, no sign.','// tracks, then bass','In the Werksviertel behind Ostbahnhof, a sound system runs on weekends that is too good for the room. You only find it if someone tells you where — or if you follow the bass.',array['House','Late','Underground']::text[],2,'Atelierstraße 10, 81671 München',array['underground','lebhaft']::text[],4.6,48.1268,11.6041,'charcoal',null,null,null,null,null,'{"hook":"Alte Remise, neue Anlage, kein Schild.","description":"Im Werksviertel hinterm Ostbahnhof läuft an Wochenenden eine Anlage, die zu gut ist für den Raum. Du findest es nur, wenn dir jemand sagt, wo — oder dem Bass folgst.","tags":["House","Spät","Underground"],"imageNote":"// gleise, dann bass"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('kellerton','Kellerton','livemusik','München','Maxvorstadt','Jazz from the cellar, until the last string.','// vinyl, valves, low light','A low cellar where a trio plays most nights and nobody checks the time. No cover most evenings, a piano that has seen things, drinks poured slowly.',array['Jazz','Live','Late']::text[],2,'Theresienstraße 46, 80333 München',array['intim','underground']::text[],4.7,48.1503,11.5662,'charcoal',null,null,null,null,null,'{"hook":"Jazz aus dem Keller, bis zur letzten Saite.","description":"Ein niedriger Keller, in dem fast jeden Abend ein Trio spielt und keiner auf die Uhr schaut. Meist kein Eintritt, ein Klavier, das schon was erlebt hat, langsam eingeschenkte Drinks.","tags":["Jazz","Live","Spät"],"imageNote":"// vinyl, röhren, wenig licht"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('dachfunk','Dachfunk','rooftop','München','Werksviertel','Spritz above the rooftops, last light included.','// above the roofs','A rooftop over the Werksviertel where the city flattens out and the Alps show up on clear evenings. Aperitivo, a short wine list, and the best seat fifteen minutes before sunset.',array['Aperitivo','View','Sunset']::text[],2,'Atelierstraße 22, 81671 München',array['lebhaft','elegant']::text[],4.5,48.1261,11.6033,'brown',null,null,null,null,null,'{"hook":"Spritz über den Dächern, Abendlicht inklusive.","description":"Ein Rooftop über dem Werksviertel, wo die Stadt flach wird und an klaren Abenden die Alpen auftauchen. Aperitivo, eine kurze Weinkarte und der beste Platz fünfzehn Minuten vor Sonnenuntergang.","tags":["Aperitivo","Aussicht","Sonnenuntergang"],"imageNote":"// über den dächern"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('lichtspiel','Lichtspiel','kino','München','Gärtnerplatzviertel','Arthouse double feature, two seats in the back.','// red velvet seats','A tiny arthouse cinema with red velvet seats and a bar that stays open after the credits. Originals only, a glass of wine you can take inside — made for a date.',array['Arthouse','Date','Wine']::text[],2,'Klenzestraße 53, 80469 München',array['intim','gemütlich']::text[],4.7,48.1296,11.5749,'charcoal',null,null,null,null,null,'{"hook":"Arthouse-Doppel, zwei Plätze ganz hinten.","description":"Ein winziges Programmkino mit roten Samtsesseln und einer Bar, die nach dem Abspann offen bleibt. Nur Originalfassungen, ein Glas Wein zum Mitnehmen — gemacht für ein Date.","tags":["Arthouse","Date","Wein"],"imageNote":"// rote samtsessel"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('zuckerbruch','Zuckerbruch','dessert','München','Glockenbachviertel','Pistachio gelato, churned this morning.','// freshly churned daily','A counter the size of a hallway that churns gelato every morning and runs out by evening. Pistachio from Bronte, a rotating fruit sorbet, a queue that''s worth it.',array['Gelato','Patisserie','Sweet']::text[],1,'Pestalozzistraße 11, 80469 München',array['lebhaft']::text[],4.6,48.1311,11.5697,'green',null,null,null,null,null,'{"hook":"Pistazien-Gelato, heute früh gedreht.","description":"Ein Tresen schmal wie ein Flur, der jeden Morgen Gelato dreht und abends ausverkauft ist. Pistazie aus Bronte, ein wechselndes Fruchtsorbet, eine Schlange, die sich lohnt.","tags":["Gelato","Patisserie","Süß"],"imageNote":"// täglich frisch gedreht"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('hallengold','Hallengold','streetfood','München','Isarvorstadt / Flaucher','Twelve stalls, one long table, no menu.','// whatever the stall has','A market hall where a dozen stalls share long communal tables. Dumplings next to tacos next to a natural-wine counter — you graze, you share, you stay too long.',array['Market','Street Food','Cheap']::text[],1,'Thalkirchner Straße 81, 80337 München',array['lebhaft']::text[],4.4,48.1227,11.5611,'brown',null,null,null,null,null,'{"hook":"Zwölf Stände, ein langer Tisch, keine Karte.","description":"Eine Markthalle, in der sich ein Dutzend Stände lange Gemeinschaftstische teilen. Dumplings neben Tacos neben einem Naturwein-Tresen — man grast, teilt und bleibt zu lang.","tags":["Markt","Street Food","Günstig"],"imageNote":"// was der stand hergibt"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('kastanienhof','Kastanienhof','biergarten','München','Haidhausen','Chestnut shade, a Maß, your own Brotzeit.','// bring your own Brotzeit','A backyard beer garden under old chestnuts where you''re allowed to bring your own food. Self-serve Maß, gravel underfoot, a corner the regulars guard quietly.',array['Maß','Brotzeit','Outdoors']::text[],1,'Preysingstraße 67, 81667 München',array['draußen','lebhaft']::text[],4.5,48.1302,11.5961,'green',null,null,null,null,null,'{"hook":"Kastanienschatten, eine Maß, eigene Brotzeit.","description":"Ein Hinterhof-Biergarten unter alten Kastanien, in dem man die eigene Brotzeit mitbringen darf. Maß in Selbstbedienung, Kies unter den Füßen, eine Ecke, die die Stammgäste leise hüten.","tags":["Maß","Brotzeit","Draußen"],"imageNote":"// brotzeit selbst mitbringen"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('kernkraft','Kernkraft','pilates','München','Glockenbachviertel','Reformer Pilates in a former workshop.','// springs, breath, focus','A small reformer studio in a converted workshop, capped at eight mats. Slow, precise classes, a teacher who corrects by name, tea afterwards.',array['Reformer','Core','Calm']::text[],3,'Baaderstraße 17, 80469 München',array['elegant','intim']::text[],4.7,48.1299,11.5763,'green',null,null,null,null,null,'{"hook":"Reformer-Pilates in einer alten Werkstatt.","description":"Ein kleines Reformer-Studio in einer umgebauten Werkstatt, maximal acht Matten. Langsame, präzise Stunden, eine Trainerin, die beim Namen korrigiert, danach Tee.","tags":["Reformer","Core","Ruhig"],"imageNote":"// federn, atem, fokus"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('isarlaeufer','Isarläufer','runclub','München','Isarvorstadt / Flaucher','Sunrise run along the Isar, coffee after.','// 6:30, every tuesday','A free run club that meets at the gravel banks before work. Two paces, no one left behind, a coffee cart waiting at the finish.',array['Run','Community','Outdoors']::text[],1,'Wittelsbacherbrücke, 80469 München',array['draußen','lebhaft']::text[],4.8,48.1221,11.5715,'brown',null,null,null,null,null,'{"hook":"Sonnenaufgangs-Lauf an der Isar, danach Kaffee.","description":"Ein kostenloser Run Club, der sich vor der Arbeit am Kiesufer trifft. Zwei Tempi, keiner bleibt zurück, am Ziel wartet ein Kaffeewagen.","tags":["Lauf","Community","Draußen"],"imageNote":"// 6:30, jeden dienstag"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('kettenreaktion','Kettenreaktion','cycleclub','München','Maxvorstadt','Indoor watt sessions, playlist too loud.','// dark room, bright legs','A basement of bikes where the lights drop and the watts climb. Forty-five minutes, a coach who counts down, towels and a shower included.',array['Spin','Watt','Loud']::text[],2,'Schellingstraße 90, 80799 München',array['lebhaft','underground']::text[],4.5,48.1514,11.5668,'charcoal',null,null,null,null,null,'{"hook":"Indoor-Watt-Sessions, Playlist zu laut.","description":"Ein Keller voller Räder, in dem das Licht runter- und die Watt hochgehen. Fünfundvierzig Minuten, ein Coach, der runterzählt, Handtücher und Dusche inklusive.","tags":["Spin","Watt","Laut"],"imageNote":"// dunkler raum, helle beine"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('eisenhof','Eisenhof','gym','München','Westend / Schwanthalerhöhe','Barbells, chalk, no mirrors for show.','// iron, not influencers','A no-frills strength gym in a Westend backyard: racks, platforms, chalk allowed. Open early and late, staff who actually spot you.',array['Strength','Barbell','Raw']::text[],2,'Gollierstraße 70, 80339 München',array['underground','lebhaft']::text[],4.6,48.1373,11.5421,'charcoal',null,null,null,null,null,'{"hook":"Hanteln, Magnesia, keine Show-Spiegel.","description":"Ein schnörkelloses Kraft-Gym in einem Westend-Hinterhof: Racks, Plattformen, Magnesia erlaubt. Früh und spät offen, Personal, das wirklich sichert.","tags":["Kraft","Langhantel","Roh"],"imageNote":"// eisen, keine influencer"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;
insert into spots (id,name,category,city,neighborhood,hook,image_note,description,tags,price_level,address,ambience,rating,lat,lng,tone,reserve_url,hours,date_label,meeting_point,ticket_url,de) values ('hallenklang','Hallenklang','konzerte','München','Werksviertel','One night, one band, three hundred ears.','// one night only','A converted hall that books a single act per night and sells out by word of mouth. Standing only, sound dialled in, no phones up front.',array['Concert','Indie','One night']::text[],2,'Speicherstraße 5, 81671 München',array['lebhaft','underground']::text[],4.7,48.1259,11.6048,'charcoal',null,null,'Fri · Jul 18 · 20:00','Speicherstraße 5 (door at the courtyard)','https://www.muenchenticket.de/','{"hook":"Ein Abend, eine Band, dreihundert Ohren.","description":"Eine umgebaute Halle, die pro Abend nur einen Act bucht und über Mundpropaganda ausverkauft. Nur Stehplätze, Sound sauber eingestellt, vorne keine Handys.","tags":["Konzert","Indie","Ein Abend"],"imageNote":"// nur an einem abend"}'::jsonb) on conflict (id) do update set name=excluded.name, category=excluded.category, city=excluded.city, neighborhood=excluded.neighborhood, hook=excluded.hook, image_note=excluded.image_note, description=excluded.description, tags=excluded.tags, price_level=excluded.price_level, address=excluded.address, ambience=excluded.ambience, rating=excluded.rating, lat=excluded.lat, lng=excluded.lng, tone=excluded.tone, reserve_url=excluded.reserve_url, hours=excluded.hours, date_label=excluded.date_label, meeting_point=excluded.meeting_point, ticket_url=excluded.ticket_url, de=excluded.de;

insert into geheimtipp_by_city (city,spot_id,week_label,teaser,teaser_de) values ('München','kellerkind','KW 26','Digging through the back room …','Wir kramen kurz im Hinterzimmer …') on conflict (city) do update set spot_id=excluded.spot_id, week_label=excluded.week_label, teaser=excluded.teaser, teaser_de=excluded.teaser_de;
