-- Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('workroom-files', 'workroom-files', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('institution-assets', 'institution-assets', true) ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket (public read, owner write)
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar owner upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar owner update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar owner delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS policies for documents bucket (authenticated users, scoped by path)
CREATE POLICY "Documents authenticated read" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Documents authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Documents owner delete" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- RLS policies for contracts bucket
CREATE POLICY "Contracts authenticated read" ON storage.objects FOR SELECT USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');
CREATE POLICY "Contracts authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

-- RLS policies for workroom-files bucket
CREATE POLICY "Workroom files authenticated read" ON storage.objects FOR SELECT USING (bucket_id = 'workroom-files' AND auth.role() = 'authenticated');
CREATE POLICY "Workroom files authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'workroom-files' AND auth.role() = 'authenticated');
CREATE POLICY "Workroom files authenticated delete" ON storage.objects FOR DELETE USING (bucket_id = 'workroom-files' AND auth.role() = 'authenticated');

-- RLS policies for institution-assets bucket
CREATE POLICY "Institution assets public read" ON storage.objects FOR SELECT USING (bucket_id = 'institution-assets');
CREATE POLICY "Institution assets admin upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'institution-assets' AND auth.role() = 'authenticated');