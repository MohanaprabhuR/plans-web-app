-- Policies persistence: run in Supabase SQL Editor (Dashboard → SQL Editor)
-- so policies survive deploys. Then set:
--   NEXT_PUBLIC_SUPABASE_URL = your project URL
--   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or ANON_KEY) = your key
--
-- Table: one row per policy, keyed by user_id + policy_id.

-- If a previous `policies` table exists without user_id (wrong schema), drop it.
-- Safe for a fresh project; skip this block if you already have real policy rows.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'policies'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'policies'
      and column_name = 'user_id'
  ) then
    drop table public.policies cascade;
  end if;
end $$;

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  policy_id text not null,
  type text not null,
  status text not null,
  provider text not null,
  provider_logo text default '',
  coverage text default '-',
  premium text default '-',
  claim_amount text default 'None',
  members jsonb default '[]'::jsonb,
  days_left int default 0,
  renewal_date text default '',
  created_at timestamptz default now(),
  unique (user_id, policy_id)
);

create index if not exists policies_user_id_idx on public.policies (user_id);

-- Buy-insurance wizard progress (used by /api/insurance/progress)
create table if not exists public.buy_insurance_progress (
  user_id text primary key,
  step_index int not null default 0,
  mode text not null default 'questions'
    check (mode in ('questions', 'plans', 'success')),
  answers jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Optional: enable RLS and allow authenticated users to manage their own rows
-- alter table public.policies enable row level security;
-- create policy "Users read own policies" on public.policies
--   for select to authenticated
--   using ((select auth.uid())::text = user_id);
-- create policy "Users insert own policies" on public.policies
--   for insert to authenticated
--   with check ((select auth.uid())::text = user_id);
-- create policy "Users update own policies" on public.policies
--   for update to authenticated
--   using ((select auth.uid())::text = user_id)
--   with check ((select auth.uid())::text = user_id);
