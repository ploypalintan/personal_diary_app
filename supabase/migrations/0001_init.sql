-- 0001_init.sql — first database schema for the diary app (run once in the Supabase SQL editor).
-- Numbered migration files: to change the database later, add 0002_..., never edit this one.

-- every diary record (todo, product, mood, income, expense) is one row
create table if not exists public.records (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  collection text        not null check (collection in ('todos','products','moods','incomes','expenses')),
  id         bigint      not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null,                 -- set by the device; decides which edit wins
  deleted    boolean     not null default false,   -- deletions are kept so other devices can delete too
  synced_at  timestamptz not null default now(),   -- set by the server; devices ask for "what's new since"
  primary key (user_id, collection, id)
);
create index if not exists records_sync_idx on public.records (user_id, synced_at);

-- small per-person settings
create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  user_name  text not null default '',
  currency   text not null default 'SGD',
  updated_at timestamptz not null default now()
);

-- what plan someone is on. Devices can read it but never change it (only the server can).
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan    text not null default 'free' check (plan in ('free','premium')),
  updated_at timestamptz not null default now()
);

-- seconds of voice transcription used per person per day (written only by the server function)
create table if not exists public.voice_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  seconds integer not null default 0,
  primary key (user_id, day)
);

-- the server sets synced_at on every write, so devices cannot fake it
create or replace function public.touch_synced_at() returns trigger language plpgsql as $$
begin new.synced_at := now(); return new; end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before insert or update on public.records
  for each row execute function public.touch_synced_at();

-- everyone gets a free plan when they sign up
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.entitlements (user_id) values (new.id) on conflict do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── privacy: row level security. Each person can only ever see and change their own rows. ──
alter table public.records       enable row level security;
alter table public.user_settings enable row level security;
alter table public.entitlements  enable row level security;
alter table public.voice_usage   enable row level security;

create policy "own records"   on public.records       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own settings"  on public.user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "read own plan" on public.entitlements  for select using (user_id = auth.uid());
create policy "read own voice usage" on public.voice_usage for select using (user_id = auth.uid());
-- (no insert/update policy on entitlements or voice_usage: only the server's service key can write them)

-- "delete my account" (required by the App Store): removes the login, and everything cascades
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = public, auth as $$
begin delete from auth.users where id = auth.uid(); end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- adds seconds to today's voice usage; callable only by the server's service key
create or replace function public.add_voice_seconds(p_user uuid, p_seconds integer) returns void language sql security definer set search_path = public as $$
  insert into public.voice_usage (user_id, day, seconds) values (p_user, (now() at time zone 'utc')::date, greatest(p_seconds, 0))
  on conflict (user_id, day) do update set seconds = public.voice_usage.seconds + greatest(p_seconds, 0);
$$;
revoke all on function public.add_voice_seconds(uuid, integer) from public, anon, authenticated;
grant execute on function public.add_voice_seconds(uuid, integer) to service_role;
