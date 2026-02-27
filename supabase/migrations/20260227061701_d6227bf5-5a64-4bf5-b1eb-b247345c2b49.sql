
-- Execution risk predictions
CREATE TABLE IF NOT EXISTS public.execution_risk_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  user_id uuid,
  institution_id uuid,
  milestone_delay_probability numeric DEFAULT 0,
  dispute_likelihood numeric DEFAULT 0,
  budget_overrun_risk numeric DEFAULT 0,
  communication_breakdown_risk numeric DEFAULT 0,
  sponsor_dissatisfaction_probability numeric DEFAULT 0,
  oversight_gap_score numeric DEFAULT 0,
  overall_risk_score numeric DEFAULT 0,
  risk_explanation text,
  suggested_actions jsonb DEFAULT '[]',
  model_version text DEFAULT '1.0',
  inputs_summary jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.execution_risk_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Risk predictions visible to authenticated" ON public.execution_risk_predictions
  FOR SELECT TO authenticated USING (true);

-- Capital allocation AI recommendations
CREATE TABLE IF NOT EXISTS public.capital_allocation_ai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid,
  recommended_entity_id uuid,
  recommended_entity_type text NOT NULL,
  recommendation_reason text,
  escrow_history_summary jsonb DEFAULT '{}',
  reliability_score numeric DEFAULT 0,
  dispute_free_rate numeric DEFAULT 0,
  domain_match_score numeric DEFAULT 0,
  budget_efficiency_score numeric DEFAULT 0,
  overall_recommendation_score numeric DEFAULT 0,
  explanation_factors jsonb DEFAULT '[]',
  model_version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.capital_allocation_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Capital AI visible to authenticated" ON public.capital_allocation_ai
  FOR SELECT TO authenticated USING (true);

-- Talent development insights
CREATE TABLE IF NOT EXISTS public.talent_development_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_gaps jsonb DEFAULT '[]',
  milestone_delay_patterns jsonb DEFAULT '{}',
  communication_weaknesses jsonb DEFAULT '[]',
  domain_opportunities jsonb DEFAULT '[]',
  career_trajectory_trend text DEFAULT 'stable',
  growth_recommendations jsonb DEFAULT '[]',
  suggested_project_types text[] DEFAULT '{}',
  skill_roadmap jsonb DEFAULT '[]',
  career_maturity_score numeric DEFAULT 0,
  leadership_readiness numeric DEFAULT 0,
  long_term_potential_indicators jsonb DEFAULT '{}',
  model_version text DEFAULT '1.0',
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE public.talent_development_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own talent insights" ON public.talent_development_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Institutional performance forecasts
CREATE TABLE IF NOT EXISTS public.institutional_performance_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  completion_rate_trend text DEFAULT 'stable',
  dispute_probability_trend text DEFAULT 'stable',
  sponsor_retention_forecast numeric DEFAULT 0,
  funding_growth_trajectory text DEFAULT 'flat',
  departmental_reliability jsonb DEFAULT '{}',
  innovation_growth_potential numeric DEFAULT 0,
  forward_stability_indicators jsonb DEFAULT '{}',
  forecast_period_months integer DEFAULT 12,
  model_version text DEFAULT '1.0',
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE public.institutional_performance_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Forecasts visible to authenticated" ON public.institutional_performance_forecasts
  FOR SELECT TO authenticated USING (true);

-- Fraud and collusion detection
CREATE TABLE IF NOT EXISTS public.fraud_collusion_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL,
  severity text DEFAULT 'medium',
  description text,
  affected_users uuid[] DEFAULT '{}',
  affected_entities jsonb DEFAULT '{}',
  evidence jsonb DEFAULT '{}',
  detection_method text DEFAULT 'ai_automated',
  human_review_required boolean DEFAULT true,
  reviewed boolean DEFAULT false,
  reviewed_by uuid,
  reviewed_at timestamptz,
  action_taken text,
  model_version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.fraud_collusion_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fraud signals admin only" ON public.fraud_collusion_signals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Smart matching results (explainable)
CREATE TABLE IF NOT EXISTS public.smart_match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_type text NOT NULL,
  entity_a_id uuid NOT NULL,
  entity_a_type text NOT NULL,
  entity_b_id uuid NOT NULL,
  entity_b_type text NOT NULL,
  execution_history_overlap numeric DEFAULT 0,
  domain_compatibility numeric DEFAULT 0,
  reliability_match numeric DEFAULT 0,
  budget_alignment numeric DEFAULT 0,
  dispute_compatibility numeric DEFAULT 0,
  overall_match_score numeric DEFAULT 0,
  explanation_factors jsonb DEFAULT '[]',
  model_version text DEFAULT '1.0',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.smart_match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match results visible to participants" ON public.smart_match_results
  FOR SELECT TO authenticated USING (auth.uid() = entity_a_id OR auth.uid() = entity_b_id);

-- Global innovation intelligence snapshots
CREATE TABLE IF NOT EXISTS public.innovation_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  region text,
  innovation_density numeric DEFAULT 0,
  cross_border_collaboration_count integer DEFAULT 0,
  funding_category_distribution jsonb DEFAULT '{}',
  emerging_corridors jsonb DEFAULT '[]',
  skill_evolution_trends jsonb DEFAULT '[]',
  active_projects integer DEFAULT 0,
  economic_volume numeric DEFAULT 0,
  snapshot_period text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.innovation_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Innovation intelligence publicly readable" ON public.innovation_intelligence
  FOR SELECT TO authenticated USING (true);

-- Escrow health AI monitoring
CREATE TABLE IF NOT EXISTS public.escrow_health_ai_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text DEFAULT 'medium',
  description text,
  affected_escrow_id uuid,
  anomaly_details jsonb DEFAULT '{}',
  recommended_action text,
  auto_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  model_version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.escrow_health_ai_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escrow health admin only" ON public.escrow_health_ai_alerts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
