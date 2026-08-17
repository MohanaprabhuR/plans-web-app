-- Onboarding questionnaire answers (one row per user).
-- Used by OnboardingStepForm → supabase.from("onboarding_responses").upsert(...)

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

create table if not exists public.onboarding_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  gender text,
  age_group text,
  employment_type text,
  dependents text,
  smoking text,
  alcohol text,
  exercise_frequency text,
  fitness_level text,
  pre_existing_conditions text,
  known_conditions text,
  hospitalized_past_5_years text,
  regular_medications text,
  monthly_income text,
  existing_insurance_policies text,
  insurance_beneficiary text,
  insurance_types_owned text[],
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists onboarding_responses_set_updated_at on public.onboarding_responses;
create trigger onboarding_responses_set_updated_at
before update on public.onboarding_responses
for each row
execute function private.set_updated_at();

alter table public.onboarding_responses enable row level security;
alter table public.onboarding_responses force row level security;

drop policy if exists "Users can select own onboarding responses" on public.onboarding_responses;
create policy "Users can select own onboarding responses"
on public.onboarding_responses
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own onboarding responses" on public.onboarding_responses;
create policy "Users can insert own onboarding responses"
on public.onboarding_responses
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own onboarding responses" on public.onboarding_responses;
create policy "Users can update own onboarding responses"
on public.onboarding_responses
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on public.onboarding_responses to authenticated;
