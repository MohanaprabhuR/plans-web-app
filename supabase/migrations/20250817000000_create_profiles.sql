-- Profiles: one row per auth user. Run in Dashboard → SQL Editor.
-- Matches /my-profile (name, email, phone, address, avatar).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  first_name text,
  last_name text,
  phone_number text,
  address text,
  city text,
  state text,
  zip_code text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

-- Create a profile row whenever a user signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := nullif(trim(coalesce(meta->>'full_name', '')), '');
  first_name text;
  last_name text;
begin
  if full_name is not null then
    first_name := split_part(full_name, ' ', 1);
    last_name := nullif(trim(substr(full_name, length(first_name) + 1)), '');
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone_number,
    avatar_url
  )
  values (
    new.id,
    new.email,
    full_name,
    first_name,
    last_name,
    nullif(meta->>'phone_number', ''),
    nullif(meta->>'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

-- Backfill existing auth users
insert into public.profiles (id, email, full_name, first_name, last_name, phone_number, avatar_url)
select
  u.id,
  u.email,
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
  nullif(split_part(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ' ', 1), ''),
  nullif(trim(substr(
    trim(coalesce(u.raw_user_meta_data->>'full_name', '')),
    length(split_part(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ' ', 1)) + 1
  )), ''),
  nullif(u.raw_user_meta_data->>'phone_number', ''),
  nullif(u.raw_user_meta_data->>'avatar_url', '')
from auth.users u
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "Users can select own profile" on public.profiles;
create policy "Users can select own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
