
-- ============================================
-- SYSTEM 1: Sovereign Reputation Passport (SRP)
-- ============================================

CREATE TABLE public.reputation_passports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passport_version INTEGER NOT NULL DEFAULT 1,
  trust_score_snapshot NUMERIC NOT NULL DEFAULT 0,
  visibility_score_snapshot NUMERIC NOT NULL DEFAULT 0,
  capability_summary JSONB DEFAULT '{}',
  outcome_summary JSONB DEFAULT '{}',
  deal_summary JSONB DEFAULT '{}',
  institutional_affiliations JSONB DEFAULT '[]',
  signed_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 year')
);

CREATE TABLE public.passport_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passport_id UUID NOT NULL REFERENCES public.reputation_passports(id) ON DELETE CASCADE,
  verifier_entity TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ
);

CREATE TABLE public.passport_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passport_id UUID NOT NULL REFERENCES public.reputation_passports(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.external_verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passport_id UUID NOT NULL REFERENCES public.reputation_passports(id) ON DELETE CASCADE,
  external_platform TEXT NOT NULL,
  access_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SRP RLS
ALTER TABLE public.reputation_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srp_owner_select" ON public.reputation_passports FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "srp_owner_insert" ON public.reputation_passports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "srp_verif_select" ON public.passport_verifications FOR SELECT USING (EXISTS (SELECT 1 FROM public.reputation_passports rp WHERE rp.id = passport_id AND (rp.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "srp_verif_insert" ON public.passport_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "srp_export_select" ON public.passport_exports FOR SELECT USING (EXISTS (SELECT 1 FROM public.reputation_passports rp WHERE rp.id = passport_id AND rp.user_id = auth.uid()));
CREATE POLICY "srp_export_insert" ON public.passport_exports FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.reputation_passports rp WHERE rp.id = passport_id AND rp.user_id = auth.uid()));
CREATE POLICY "srp_extlog_select" ON public.external_verification_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.reputation_passports rp WHERE rp.id = passport_id AND (rp.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "srp_extlog_insert" ON public.external_verification_logs FOR INSERT WITH CHECK (true);

CREATE INDEX idx_passports_user ON public.reputation_passports(user_id);
CREATE INDEX idx_passports_hash ON public.reputation_passports(signed_hash);

-- ============================================
-- SYSTEM 2: Global Research Liquidity Index (GRLI)
-- ============================================

CREATE TABLE public.skill_market_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_name TEXT NOT NULL,
  total_active_projects INTEGER DEFAULT 0,
  total_active_bids INTEGER DEFAULT 0,
  avg_bid_price NUMERIC DEFAULT 0,
  avg_project_budget NUMERIC DEFAULT 0,
  deal_conversion_rate NUMERIC DEFAULT 0,
  trust_weighted_success_rate NUMERIC DEFAULT 0,
  liquidity_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.regional_skill_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  supply_count INTEGER DEFAULT 0,
  demand_count INTEGER DEFAULT 0,
  gap_score NUMERIC DEFAULT 0,
  avg_trust NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.economic_velocity_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_name TEXT NOT NULL,
  income_last_30_days NUMERIC DEFAULT 0,
  income_last_90_days NUMERIC DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  volatility_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.institutional_liquidity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  total_skill_liquidity NUMERIC DEFAULT 0,
  economic_velocity NUMERIC DEFAULT 0,
  avg_conversion_rate NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GRLI RLS
ALTER TABLE public.skill_market_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_skill_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_velocity_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_liquidity_metrics ENABLE ROW LEVEL SECURITY;

-- Global skill metrics are publicly readable
CREATE POLICY "smm_public_read" ON public.skill_market_metrics FOR SELECT USING (true);
CREATE POLICY "smm_admin_insert" ON public.skill_market_metrics FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "smm_admin_update" ON public.skill_market_metrics FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "rsm_public_read" ON public.regional_skill_metrics FOR SELECT USING (true);
CREATE POLICY "rsm_admin_manage" ON public.regional_skill_metrics FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "evi_public_read" ON public.economic_velocity_index FOR SELECT USING (true);
CREATE POLICY "evi_admin_manage" ON public.economic_velocity_index FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "ilm_inst_read" ON public.institutional_liquidity_metrics FOR SELECT USING (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));
CREATE POLICY "ilm_admin_manage" ON public.institutional_liquidity_metrics FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX idx_smm_skill ON public.skill_market_metrics(skill_name);
CREATE INDEX idx_rsm_region_skill ON public.regional_skill_metrics(region, skill_name);
CREATE INDEX idx_evi_skill ON public.economic_velocity_index(skill_name);

-- ============================================
-- SYSTEM 3: Autonomous Collaboration Pods (ACP)
-- ============================================

CREATE TABLE public.collaboration_pods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  pod_score NUMERIC DEFAULT 0,
  trust_compatibility_score NUMERIC DEFAULT 0,
  skill_completeness_score NUMERIC DEFAULT 0,
  historical_synergy_score NUMERIC DEFAULT 0,
  pricing_alignment_score NUMERIC DEFAULT 0,
  overall_execution_probability NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pod_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.collaboration_pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_role TEXT NOT NULL,
  role_skill_match_score NUMERIC DEFAULT 0,
  trust_score_snapshot NUMERIC DEFAULT 0,
  availability_status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.collaboration_history_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID NOT NULL REFERENCES auth.users(id),
  user_b UUID NOT NULL REFERENCES auth.users(id),
  completed_projects INTEGER DEFAULT 0,
  avg_deal_health NUMERIC DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  synergy_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_a, user_b)
);

CREATE TABLE public.pod_execution_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.collaboration_pods(id) ON DELETE CASCADE,
  deal_success BOOLEAN,
  completion_time NUMERIC,
  trust_delta NUMERIC DEFAULT 0,
  economic_output NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ACP RLS
ALTER TABLE public.collaboration_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_history_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_execution_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pods_auth_read" ON public.collaboration_pods FOR SELECT TO authenticated USING (true);
CREATE POLICY "pods_admin_insert" ON public.collaboration_pods FOR INSERT WITH CHECK (public.is_admin(auth.uid()) OR true);
CREATE POLICY "pm_auth_read" ON public.pod_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "pm_insert" ON public.pod_members FOR INSERT WITH CHECK (true);
CREATE POLICY "chm_auth_read" ON public.collaboration_history_matrix FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b OR public.is_admin(auth.uid()));
CREATE POLICY "chm_manage" ON public.collaboration_history_matrix FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "pem_auth_read" ON public.pod_execution_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "pem_insert" ON public.pod_execution_metrics FOR INSERT WITH CHECK (true);

CREATE INDEX idx_pods_project ON public.collaboration_pods(project_id);
CREATE INDEX idx_pm_pod ON public.pod_members(pod_id);
CREATE INDEX idx_chm_users ON public.collaboration_history_matrix(user_a, user_b);

-- ============================================
-- SYSTEM 4: AI Negotiation & Deal Intelligence (ANDI)
-- ============================================

CREATE TABLE public.negotiation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL,
  initiated_by UUID NOT NULL REFERENCES auth.users(id),
  suggested_price_range JSONB DEFAULT '{}',
  risk_score NUMERIC DEFAULT 0,
  dispute_probability NUMERIC DEFAULT 0,
  trust_impact_projection NUMERIC DEFAULT 0,
  suggested_milestones JSONB DEFAULT '[]',
  negotiation_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pricing_intelligence_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_name TEXT NOT NULL,
  liquidity_score NUMERIC DEFAULT 0,
  avg_market_price NUMERIC DEFAULT 0,
  recommended_price_low NUMERIC DEFAULT 0,
  recommended_price_high NUMERIC DEFAULT 0,
  volatility_score NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.dispute_prediction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL,
  predicted_risk_score NUMERIC DEFAULT 0,
  contributing_factors JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.revenue_split_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID REFERENCES public.collaboration_pods(id),
  suggested_distribution JSONB DEFAULT '{}',
  fairness_score NUMERIC DEFAULT 0,
  trust_projection NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ANDI RLS
ALTER TABLE public.negotiation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_intelligence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_prediction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_split_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ns_participant_read" ON public.negotiation_sessions FOR SELECT TO authenticated USING (auth.uid() = initiated_by OR public.is_admin(auth.uid()));
CREATE POLICY "ns_insert" ON public.negotiation_sessions FOR INSERT WITH CHECK (auth.uid() = initiated_by);
CREATE POLICY "pil_public_read" ON public.pricing_intelligence_logs FOR SELECT USING (true);
CREATE POLICY "pil_admin_insert" ON public.pricing_intelligence_logs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "dpl_auth_read" ON public.dispute_prediction_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "dpl_insert" ON public.dispute_prediction_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "rss_auth_read" ON public.revenue_split_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "rss_insert" ON public.revenue_split_simulations FOR INSERT WITH CHECK (true);

CREATE INDEX idx_ns_deal ON public.negotiation_sessions(deal_id);
CREATE INDEX idx_pil_skill ON public.pricing_intelligence_logs(skill_name);
CREATE INDEX idx_dpl_deal ON public.dispute_prediction_logs(deal_id);
