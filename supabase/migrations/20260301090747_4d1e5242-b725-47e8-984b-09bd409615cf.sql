
ALTER TABLE public.research_artifacts ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE public.research_artifacts ADD COLUMN IF NOT EXISTS milestone_id UUID;
ALTER TABLE public.research_artifacts ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Untitled';
ALTER TABLE public.research_artifacts ADD COLUMN IF NOT EXISTS version_number INT DEFAULT 1;
ALTER TABLE public.research_artifacts ADD COLUMN IF NOT EXISTS mime_type TEXT;
