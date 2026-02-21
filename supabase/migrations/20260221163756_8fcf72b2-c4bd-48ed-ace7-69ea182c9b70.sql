
-- Add image_url column to stories table
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for story media
INSERT INTO storage.buckets (id, name, public) VALUES ('story-media', 'story-media', true)
ON CONFLICT (id) DO NOTHING;

-- Post media: anyone can view
CREATE POLICY "Post media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

-- Post media: authenticated users can upload to their own folder
CREATE POLICY "Users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Post media: users can update their own uploads
CREATE POLICY "Users can update own post media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Post media: users can delete their own uploads
CREATE POLICY "Users can delete own post media"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Story media: anyone can view
CREATE POLICY "Story media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-media');

-- Story media: authenticated users can upload to their own folder
CREATE POLICY "Users can upload story media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Story media: users can delete their own uploads
CREATE POLICY "Users can delete own story media"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-media' AND auth.uid()::text = (storage.foldername(name))[1]);
