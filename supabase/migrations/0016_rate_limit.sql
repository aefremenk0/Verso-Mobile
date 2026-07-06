-- Verso 0016 — rate-limit anonymous inserts (analytics_events / spot_suggestions).
-- Run once in the Supabase SQL editor.
--
-- The insert policies allow guests (anon key) to write these tables. Without a
-- limit, anyone with the public key could spam them (storage bloat / DoS). This
-- adds a lightweight fixed-window limiter keyed by a HASH of the client IP
-- (never the raw IP — privacy-first). A BEFORE INSERT trigger raises when a
-- bucket exceeds its budget; the app's insert paths are fail-soft, so a rejected
-- insert is silently dropped, never a crash.

-- Counter store. Only SECURITY DEFINER functions (and the service role) touch it;
-- RLS with no policy => the client can neither read nor write it directly.
create table if not exists rate_limits (
  bucket  text primary key,
  count   int not null default 0,
  expires timestamptz not null
);
alter table rate_limits enable row level security;

create or replace function public.enforce_rate_limit(
  tag text, max_rows int, window_seconds int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ip  text;
  win bigint;
  key text;
  cur int;
begin
  -- Client IP from the PostgREST request headers (best effort). Absent for the
  -- service role / direct SQL -> a single 'unknown' bucket (harmless).
  ip := split_part(
    coalesce(
      nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for',
      ''
    ), ',', 1
  );
  if ip is null or ip = '' then
    ip := 'unknown';
  end if;

  -- Fixed window: which N-second slot are we in?
  win := floor(extract(epoch from clock_timestamp()) / window_seconds)::bigint;
  -- md5 so the raw IP is never stored.
  key := md5(ip || ':' || tag || ':' || win::text);

  insert into public.rate_limits (bucket, count, expires)
    values (key, 1, clock_timestamp() + make_interval(secs => window_seconds))
  on conflict (bucket)
    do update set count = public.rate_limits.count + 1
  returning count into cur;

  if cur > max_rows then
    raise exception 'rate limit exceeded' using errcode = '53400';
  end if;

  -- Opportunistic cleanup of expired buckets (~1% of calls -> cheap on average).
  if random() < 0.01 then
    delete from public.rate_limits where expires < clock_timestamp();
  end if;
end;
$$;

revoke all on function public.enforce_rate_limit(text, int, int) from public;

-- analytics_events: 120 events / minute / IP (generous; events are fire-and-forget).
create or replace function public.rl_analytics_events()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.enforce_rate_limit('analytics', 120, 60);
  return new;
end;
$$;
drop trigger if exists rl_analytics on analytics_events;
create trigger rl_analytics
  before insert on analytics_events
  for each row execute function public.rl_analytics_events();

-- spot_suggestions: 10 submissions / hour / IP (a human suggests a few, not 100s).
create or replace function public.rl_spot_suggestions()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.enforce_rate_limit('suggestions', 10, 3600);
  return new;
end;
$$;
drop trigger if exists rl_suggestions on spot_suggestions;
create trigger rl_suggestions
  before insert on spot_suggestions
  for each row execute function public.rl_spot_suggestions();
