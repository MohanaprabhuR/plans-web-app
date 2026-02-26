-- Policies persistence: run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- so policies survive Vercel deploys. Then set on Vercel:
--   NEXT_PUBLIC_SUPABASE_URL = your project URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY = your anon key
-- Table: one row per policy, keyed by user_id + policy_id.

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
  unique(user_id, policy_id)
);

create index if not exists policies_user_id_idx on public.policies (user_id);

-- Optional: enable RLS and allow service role / anon based on your auth
-- alter table public.policies enable row level security;
-- create policy "Users can manage own policies" on public.policies
--   for all using (auth.uid()::text = user_id);
