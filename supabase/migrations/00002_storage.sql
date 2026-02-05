-- Create storage bucket for project documents
insert into storage.buckets (id, name, public) values ('documents', 'documents', true);

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies for documents
create policy "Authenticated users can upload documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents');

create policy "Anyone can view documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents');

create policy "Document uploaders can delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for avatars
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Anyone can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
