
-- Create visibility_scores table
CREATE TABLE public.visibility_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility_score NUMERIC NOT NULL DEFAULT 0,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visibility_scores_user_id ON public.visibility_scores(user_id);
CREATE INDEX idx_visibility_scores_calculated_at ON public.visibility_scores(calculated_at DESC);
CREATE INDEX idx_visibility_scores_score ON public.visibility_scores(visibility_score DESC);

-- Add cached visibility_score to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS visibility_score NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE public.visibility_scores ENABLE ROW LEVEL SECURITY;

-- Users can read their own scores
CREATE POLICY "Users can view own visibility scores"
  ON public.visibility_scores FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all visibility scores"
  ON public.visibility_scores FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Only system (edge function) inserts via service role
CREATE POLICY "Service role inserts visibility scores"
  ON public.visibility_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin update policy
CREATE POLICY "Admins can update visibility scores"
  ON public.visibility_scores FOR UPDATE
  USING (public.is_admin(auth.uid()));
