
-- =====================================================
-- VALUE-OPTIMIZED SOCIAL INTELLIGENCE ENGINE
-- =====================================================

-- 1. User Algorithm Intent Modes (Section 2)
CREATE TABLE IF NOT EXISTS public.user_algorithm_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  active_mode TEXT NOT NULL DEFAULT 'skill_discovery',
  custom_weights JSONB DEFAULT '{}',
  entertainment_cap NUMERIC DEFAULT 0.1,
  min_depth_threshold NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Feed Value Rankings (Section 1)
CREATE TABLE IF NOT EXISTS public.feed_value_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  execution_depth NUMERIC DEFAULT 0,
  skill_demonstration NUMERIC DEFAULT 0,
  funding_relevance NUMERIC DEFAULT 0,
  collaboration_opportunity NUMERIC DEFAULT 0,
  innovation_impact NUMERIC DEFAULT 0,
  domain_relevance NUMERIC DEFAULT 0,
  long_term_usefulness NUMERIC DEFAULT 0,
  institutional_credibility NUMERIC DEFAULT 0,
  integrity_confidence NUMERIC DEFAULT 0,
  learning_value NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  composite_value NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Feed Explainability Records (Section 3)
CREATE TABLE IF NOT EXISTS public.feed_explainability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id TEXT NOT NULL,
  skill_alignment_pct NUMERIC DEFAULT 0,
  domain_match_pct NUMERIC DEFAULT 0,
  collaboration_potential_pct NUMERIC DEFAULT 0,
  funding_overlap_pct NUMERIC DEFAULT 0,
  innovation_relevance_pct NUMERIC DEFAULT 0,
  long_term_utility NUMERIC DEFAULT 0,
  explanation_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Virality Cap & Fairness (Section 4)
CREATE TABLE IF NOT EXISTS public.virality_cap_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  engagement_velocity NUMERIC DEFAULT 0,
  dampening_factor NUMERIC DEFAULT 1.0,
  exposure_fairness_adj NUMERIC DEFAULT 0,
  early_creator_boost BOOLEAN DEFAULT false,
  saturation_limited BOOLEAN DEFAULT false,
  diversity_boost NUMERIC DEFAULT 0,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Value Feedback Ratings (Section 12)
CREATE TABLE IF NOT EXISTS public.content_value_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id TEXT NOT NULL,
  usefulness_rating NUMERIC,
  skill_depth_rating NUMERIC,
  practical_relevance NUMERIC,
  collaboration_potential NUMERIC,
  learning_impact NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- 6. Long-Term Value Decay Tracking (Section 6)
CREATE TABLE IF NOT EXISTS public.long_term_value_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  day_30_retention NUMERIC DEFAULT 0,
  day_90_revisit_freq NUMERIC DEFAULT 0,
  skill_reuse_rate NUMERIC DEFAULT 0,
  collaboration_conversion NUMERIC DEFAULT 0,
  grant_reference_usage NUMERIC DEFAULT 0,
  replication_influence NUMERIC DEFAULT 0,
  composite_ltv NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Algorithm Manipulation Detection (Section 8)
CREATE TABLE IF NOT EXISTS public.algorithm_manipulation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'post',
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  evidence JSONB DEFAULT '{}',
  dampening_applied NUMERIC DEFAULT 0,
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Collaboration Probability Scores (Section 7)
CREATE TABLE IF NOT EXISTS public.collaboration_probability_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  collab_formation_prob NUMERIC DEFAULT 0,
  funding_application_prob NUMERIC DEFAULT 0,
  skill_development_prob NUMERIC DEFAULT 0,
  innovation_extension_prob NUMERIC DEFAULT 0,
  project_iteration_prob NUMERIC DEFAULT 0,
  industry_partnership_prob NUMERIC DEFAULT 0,
  composite_outcome_prob NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_algorithm_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_value_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_explainability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virality_cap_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_value_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.long_term_value_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_manipulation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_probability_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Auth read algo_modes" ON public.user_algorithm_modes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert algo_modes" ON public.user_algorithm_modes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update algo_modes" ON public.user_algorithm_modes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Auth read feed_rankings" ON public.feed_value_rankings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert feed_rankings" ON public.feed_value_rankings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read feed_explain" ON public.feed_explainability FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert feed_explain" ON public.feed_explainability FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read virality_cap" ON public.virality_cap_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert virality_cap" ON public.virality_cap_records FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read value_feedback" ON public.content_value_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own insert value_feedback" ON public.content_value_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth read ltv_tracking" ON public.long_term_value_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ltv_tracking" ON public.long_term_value_tracking FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read manip_flags" ON public.algorithm_manipulation_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert manip_flags" ON public.algorithm_manipulation_flags FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read collab_prob" ON public.collaboration_probability_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert collab_prob" ON public.collaboration_probability_scores FOR INSERT TO authenticated WITH CHECK (true);
