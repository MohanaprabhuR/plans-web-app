-- User-owned insurance policies (dashboard add/edit policy).
-- Separate from any existing public.policies catalog/seed table.

create table if not exists public.user_policies (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, policy_id)
);

create index if not exists user_policies_user_id_idx on public.user_policies (user_id);

alter table public.user_policies disable row level security;
alter table public.user_policies no force row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.user_policies to anon, authenticated;
