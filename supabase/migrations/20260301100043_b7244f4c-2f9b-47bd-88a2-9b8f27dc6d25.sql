
-- Add ranking columns to global_search_index
ALTER TABLE public.global_search_index 
  ADD COLUMN IF NOT EXISTS relevance_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recency_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activity_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS execution_quality_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS composite_rank_score NUMERIC(5,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_search_composite_rank ON public.global_search_index(composite_rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_entity_type ON public.global_search_index(entity_type);
CREATE INDEX IF NOT EXISTS idx_search_visibility ON public.global_search_index(visibility_scope);
CREATE INDEX IF NOT EXISTS idx_search_institution ON public.global_search_index(institution_id);

-- Tag Index
CREATE TABLE public.tag_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tag_name, entity_type, entity_id)
);
ALTER TABLE public.tag_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read tags" ON public.tag_index FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated insert tags" ON public.tag_index FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_tag_name ON public.tag_index(tag_name);
CREATE INDEX idx_tag_entity ON public.tag_index(entity_type, entity_id);

-- Discovery Recommendations
CREATE TABLE public.discovery_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.discovery_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own recommendations" ON public.discovery_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_discovery_user ON public.discovery_recommendations(user_id, generated_at DESC);

-- Project Similarity Index
CREATE TABLE public.project_similarity_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  similar_project_id UUID NOT NULL,
  similarity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, similar_project_id)
);
ALTER TABLE public.project_similarity_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read similarity" ON public.project_similarity_index FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_similarity_project ON public.project_similarity_index(project_id, similarity_score DESC);

-- Search abuse logging
CREATE TABLE public.search_query_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  entity_type_filter TEXT,
  results_count INT DEFAULT 0,
  response_time_ms INT DEFAULT 0,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.search_query_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service role inserts search logs" ON public.search_query_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_search_logs_user ON public.search_query_logs(user_id, created_at DESC);
CREATE INDEX idx_search_logs_flagged ON public.search_query_logs(flagged) WHERE flagged = true;

-- RPC: compute_search_rank
CREATE OR REPLACE FUNCTION public.compute_search_rank(p_entity_type TEXT, p_entity_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recency NUMERIC := 0;
  v_activity NUMERIC := 0;
  v_execution NUMERIC := 0;
  v_composite NUMERIC := 0;
  v_updated_at TIMESTAMPTZ;
BEGIN
  SELECT updated_at INTO v_updated_at
  FROM global_search_index
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id::TEXT;

  IF v_updated_at IS NULL THEN RETURN 0; END IF;

  -- Recency: 0-100, decays over 90 days
  v_recency := GREATEST(0, 100 - EXTRACT(EPOCH FROM (now() - v_updated_at)) / 86400 * 1.11);

  -- Activity: count recent activity_feed entries
  SELECT LEAST(100, COUNT(*) * 5) INTO v_activity
  FROM activity_feed
  WHERE entity_id = p_entity_id::TEXT
    AND created_at > now() - interval '30 days';

  -- Execution quality from trust profiles (if user entity)
  IF p_entity_type = 'user' THEN
    SELECT COALESCE(trust_score, 50) INTO v_execution
    FROM user_trust_profiles
    WHERE user_id = p_entity_id;
  ELSE
    v_execution := 50;
  END IF;

  v_composite := v_recency * 0.25 + v_activity * 0.30 + v_execution * 0.45;

  UPDATE global_search_index
  SET recency_score = ROUND(v_recency, 2),
      activity_score = ROUND(v_activity, 2),
      execution_quality_score = ROUND(v_execution, 2),
      composite_rank_score = ROUND(v_composite, 2)
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id::TEXT;

  RETURN ROUND(v_composite, 2);
END;
$$;
