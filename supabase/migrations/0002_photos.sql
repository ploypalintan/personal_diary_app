-- 0002_photos.sql — private storage for product photos (run after 0001).
-- Each person's photos live in a folder named after their user id and only they can see them.
insert into storage.buckets (id, name, public) values ('photos', 'photos', false) on conflict (id) do nothing;

create policy "own photos: read"   on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own photos: add"    on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own photos: change" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own photos: remove" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
