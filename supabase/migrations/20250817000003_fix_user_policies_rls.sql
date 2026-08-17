-- RLS policies for user_policies when the API sends the user's JWT.
-- Run this if inserts still fail with "row-level security policy" errors.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_policies'
  loop
    execute format(
      'drop policy if exists %I on public.user_policies',
      pol.policyname
    );
  end loop;
end $$;

alter table public.user_policies enable row level security;
alter table public.user_policies no force row level security;

create policy "Users select own policies"
on public.user_policies
for select
to authenticated
using ((select auth.uid())::text = user_id);

create policy "Users insert own policies"
on public.user_policies
for insert
to authenticated
with check ((select auth.uid())::text = user_id);

create policy "Users update own policies"
on public.user_policies
for update
to authenticated
using ((select auth.uid())::text = user_id)
with check ((select auth.uid())::text = user_id);

create policy "Users delete own policies"
on public.user_policies
for delete
to authenticated
using ((select auth.uid())::text = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.user_policies to authenticated;
