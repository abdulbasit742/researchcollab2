
-- Sponsor follow-up reminders
CREATE TABLE public.sponsor_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsor_pipeline(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'follow_up',
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsor_follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage follow-ups" ON public.sponsor_follow_ups FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Sponsor scoring model
CREATE TABLE public.sponsor_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsor_pipeline(id) ON DELETE CASCADE,
  engagement_score NUMERIC DEFAULT 0,
  funding_likelihood NUMERIC DEFAULT 0,
  retention_probability NUMERIC DEFAULT 0,
  response_time_avg_hours NUMERIC DEFAULT 0,
  segment TEXT DEFAULT 'unknown',
  industry TEXT,
  company_size TEXT,
  last_scored_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sponsor_id)
);
ALTER TABLE public.sponsor_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sponsor scores" ON public.sponsor_scores FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Sponsor engagement events (for heatmap)
CREATE TABLE public.sponsor_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsor_pipeline(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsor_engagement_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage engagement events" ON public.sponsor_engagement_events FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Add response tracking columns to sponsor_pipeline
ALTER TABLE public.sponsor_pipeline 
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS response_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'unclassified';

-- Indexes for performance
CREATE INDEX idx_sponsor_follow_ups_sponsor ON public.sponsor_follow_ups(sponsor_id);
CREATE INDEX idx_sponsor_follow_ups_scheduled ON public.sponsor_follow_ups(scheduled_at) WHERE completed_at IS NULL;
CREATE INDEX idx_sponsor_scores_sponsor ON public.sponsor_scores(sponsor_id);
CREATE INDEX idx_sponsor_engagement_date ON public.sponsor_engagement_events(event_date);
CREATE INDEX idx_sponsor_engagement_sponsor ON public.sponsor_engagement_events(sponsor_id);
