
-- Opportunity Intelligence Engine: insights storage table
CREATE TABLE public.opportunity_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_score NUMERIC NOT NULL DEFAULT 0 CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  projected_income NUMERIC NOT NULL DEFAULT 0,
  skill_gap_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  trust_growth_potential NUMERIC NOT NULL DEFAULT 0,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  market_heat_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  snapshot_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast user lookups and trend queries
CREATE INDEX idx_opportunity_insights_user_created ON public.opportunity_insights (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.opportunity_insights ENABLE ROW LEVEL SECURITY;

-- Users can only view their own insights
CREATE POLICY "Users can view own insights"
  ON public.opportunity_insights FOR SELECT
  USING (auth.uid() = user_id);

-- Only backend (service role via edge functions) inserts; users insert their own
CREATE POLICY "Users can insert own insights"
  ON public.opportunity_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all insights"
  ON public.opportunity_insights FOR SELECT
  USING (public.is_admin(auth.uid()));
