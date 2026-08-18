-- Avatars storage bucket for profile pictures. Run in Dashboard → SQL Editor.
-- Backs /my-profile → "Change Profile Picture": uploads to
-- avatars/<user_id>/avatar.<ext> (client.storage.from("avatars")) and reads
-- the image via a public URL, so the bucket must be public-read.

-- 1. Create the bucket (public read). Idempotent.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 2. Anyone can read avatar images (public profile pictures).
drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

-- 3. A signed-in user may write only inside their own folder
--    (path is "<user_id>/avatar.<ext>", so the first segment is their uid).
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- 4. Upload uses upsert:true, which updates an existing object — allow it.
drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- 5. Let a user remove their own avatar.
drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
