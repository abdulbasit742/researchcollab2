
-- Add missing columns to peer_review_requests for the AI Peer Review Network
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS abstract TEXT;
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS research_domain TEXT;
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal';
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create peer_review_responses table
CREATE TABLE IF NOT EXISTS public.peer_review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.peer_review_requests(id),
  reviewer_id UUID NOT NULL,
  overall_rating INTEGER,
  methodology_score INTEGER,
  novelty_score INTEGER,
  rigor_score INTEGER,
  feedback_text TEXT,
  recommendation TEXT NOT NULL DEFAULT 'revise',
  ai_assisted BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peer_review_responses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Reviewers see own responses" ON public.peer_review_responses FOR SELECT TO authenticated USING (reviewer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Reviewers can create responses" ON public.peer_review_responses FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Reviewers can update own responses" ON public.peer_review_responses FOR UPDATE TO authenticated USING (reviewer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
