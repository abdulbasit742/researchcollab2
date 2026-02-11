
-- Create earning_project_attachments table
CREATE TABLE public.earning_project_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.earning_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.earning_project_attachments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read attachments for open projects
CREATE POLICY "Authenticated users can view attachments"
ON public.earning_project_attachments
FOR SELECT
TO authenticated
USING (true);

-- Only project owner can insert attachments
CREATE POLICY "Project owners can insert attachments"
ON public.earning_project_attachments
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.earning_projects
    WHERE id = project_id AND owner_id = auth.uid()
  )
);

-- Only project owner can delete attachments
CREATE POLICY "Project owners can delete attachments"
ON public.earning_project_attachments
FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.earning_projects
    WHERE id = project_id AND owner_id = auth.uid()
  )
);

-- Create storage bucket for earning attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('earning-attachments', 'earning-attachments', true);

-- Storage policies
CREATE POLICY "Authenticated users can view earning attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'earning-attachments');

CREATE POLICY "Authenticated users can upload earning attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'earning-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own earning attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'earning-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
