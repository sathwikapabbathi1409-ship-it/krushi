CREATE POLICY "Users manage own crop images" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users manage own avatars" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);