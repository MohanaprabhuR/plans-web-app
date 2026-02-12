-- Create the onboarding_responses table.
-- Run this in Supabase Dashboard: SQL Editor → New query → paste and Run.
--
--   alter table public.onboarding_responses alter column known_conditions type text using array_to_string(known_conditions, ', ');
-- If you already have the table without user_id, you can also run:
--   alter table public.onboarding_responses add column if not exists user_id uuid;
--   create unique index if not exists onboarding_responses_user_id_idx on public.onboarding_responses(user_id);

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  -- Personal
  gender text,
  age_group text,
  employment_type text,
  dependents text,
  -- Lifestyle
  smoking text,
  alcohol text,
  exercise_frequency text,
  fitness_level text,
  -- Medical
  pre_existing_conditions text,
  known_conditions text,
  hospitalized_past_5_years text,
  regular_medications text,
  -- Financial
  monthly_income text,
  existing_insurance_policies text,
  insurance_beneficiary text,
  insurance_types_owned text[],
  submitted_at timestamptz,
  user_id uuid references auth.users (id)
);

-- Allow anonymous/authenticated inserts (adjust with RLS if you add auth later)
alter table public.onboarding_responses enable row level security;

create policy "Allow insert for all"
  on public.onboarding_responses
  for insert
  with check (true);

create policy "Allow update for all"
  on public.onboarding_responses
  for update
  using (true)
  with check (true);

create policy "Allow read for all"
  on public.onboarding_responses
  for select
  using (true);

-- Ensure one row per user when using upsert(user_id)
create unique index if not exists onboarding_responses_user_id_idx
  on public.onboarding_responses(user_id);
