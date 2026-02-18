
-- Professional Identity Domination Engine tables

-- Verified Skills with badge levels
CREATE TABLE public.verified_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  skill_name TEXT NOT NULL,
  badge_level TEXT NOT NULL DEFAULT 'demonstrated' CHECK (badge_level IN ('demonstrated', 'repeatedly_delivered', 'high_performance', 'enterprise_validated')),
  milestones_delivered INTEGER DEFAULT 0,
  sponsor_confirmations INTEGER DEFAULT 0,
  peer_reviews INTEGER DEFAULT 0,
  ai_quality_score NUMERIC DEFAULT 0,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delivery Consistency Index
CREATE TABLE public.delivery_consistency_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) UNIQUE,
  on_time_completion_pct NUMERIC DEFAULT 0,
  budget_adherence_pct NUMERIC DEFAULT 0,
  dispute_frequency NUMERIC DEFAULT 0,
  rehire_rate NUMERIC DEFAULT 0,
  milestone_variance NUMERIC DEFAULT 0,
  sponsor_repeat_rate NUMERIC DEFAULT 0,
  consistency_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Opportunity Routing
CREATE TABLE public.opportunity_routing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  opportunity_type TEXT NOT NULL,
  opportunity_id UUID,
  match_score NUMERIC DEFAULT 0,
  trust_weight NUMERIC DEFAULT 0,
  skill_match_pct NUMERIC DEFAULT 0,
  routed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- Professional Value Score
CREATE TABLE public.professional_value_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) UNIQUE,
  capital_handled NUMERIC DEFAULT 0,
  reliability_score NUMERIC DEFAULT 0,
  skill_depth_score NUMERIC DEFAULT 0,
  execution_speed_score NUMERIC DEFAULT 0,
  startup_success_score NUMERIC DEFAULT 0,
  dispute_avoidance_score NUMERIC DEFAULT 0,
  trust_stability_score NUMERIC DEFAULT 0,
  overall_value_score NUMERIC DEFAULT 0,
  hiring_likelihood_pct NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature Alignment Audit (Simplification Protocol)
CREATE TABLE public.feature_alignment_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  engine_alignment INTEGER CHECK (engine_alignment IN (1, 2, 3)),
  revenue_impact TEXT DEFAULT 'low',
  adoption_impact TEXT DEFAULT 'low',
  complexity_cost TEXT DEFAULT 'low',
  keep_or_cut TEXT DEFAULT 'keep' CHECK (keep_or_cut IN ('keep', 'cut', 'merge', 'deprioritize')),
  notes TEXT,
  audited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Regional Domination Metrics
CREATE TABLE public.regional_domination_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_name TEXT NOT NULL,
  period TEXT NOT NULL,
  funded_fyp_count INTEGER DEFAULT 0,
  escrow_volume NUMERIC DEFAULT 0,
  corporate_sponsors_active INTEGER DEFAULT 0,
  university_integrations INTEGER DEFAULT 0,
  milestone_completion_rate NUMERIC DEFAULT 0,
  employment_conversion_pct NUMERIC DEFAULT 0,
  startup_spinoffs INTEGER DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  retention_rate NUMERIC DEFAULT 0,
  revenue_growth_pct NUMERIC DEFAULT 0,
  capital_cycle_days NUMERIC DEFAULT 0,
  dominance_score NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Corporate Hiring Candidates view
CREATE TABLE public.corporate_hiring_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  corporate_id UUID,
  trust_score INTEGER DEFAULT 0,
  delivery_consistency NUMERIC DEFAULT 0,
  ai_hiring_match_pct NUMERIC DEFAULT 0,
  skill_roi_index NUMERIC DEFAULT 0,
  employment_stability_prediction NUMERIC DEFAULT 0,
  escrow_work_history_count INTEGER DEFAULT 0,
  dispute_exposure NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.verified_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_consistency_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_value_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_alignment_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_domination_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_hiring_candidates ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users view own verified skills" ON public.verified_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own delivery index" ON public.delivery_consistency_index FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own routing" ON public.opportunity_routing FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own value score" ON public.professional_value_scores FOR SELECT USING (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admins manage verified skills" ON public.verified_skills FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage delivery index" ON public.delivery_consistency_index FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage routing" ON public.opportunity_routing FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage value scores" ON public.professional_value_scores FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage feature audit" ON public.feature_alignment_audit FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage regional metrics" ON public.regional_domination_metrics FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage hiring candidates" ON public.corporate_hiring_candidates FOR ALL USING (public.is_admin(auth.uid()));

-- Public read for regional metrics
CREATE POLICY "Public view regional metrics" ON public.regional_domination_metrics FOR SELECT USING (true);
