
-- Add missing columns to document_comments for rich comment support
ALTER TABLE public.document_comments
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.document_comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS anchor_text TEXT,
  ADD COLUMN IF NOT EXISTS is_suggestion BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS suggestion_content TEXT,
  ADD COLUMN IF NOT EXISTS suggestion_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS resolved_by UUID,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
