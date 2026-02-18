
-- ============================================
-- GOVERNMENT ROLLOUT FRAMEWORK
-- ============================================

CREATE TABLE IF NOT EXISTS public.government_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_node_id UUID,
  ministry_name TEXT NOT NULL,
  participation_type TEXT DEFAULT 'observer' CHECK (participation_type IN ('observer','capital_contributor','policy_partner','national_anchor','regulatory_alignment')),
  participation_scope TEXT,
  funding_commitment NUMERIC DEFAULT 0,
  data_visibility_scope TEXT DEFAULT 'aggregated',
  policy_alignment_status TEXT DEFAULT 'pending',
  compliance_level TEXT DEFAULT 'basic',
  certification_status TEXT DEFAULT 'uncertified',
  certification_expires_at TIMESTAMPTZ,
  anti_capture_acknowledged BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.government_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gov partners publicly readable" ON public.government_partners FOR SELECT USING (true);
CREATE POLICY "Admins manage gov partners" ON public.government_partners FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.government_fund_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.government_partners(id),
  fund_name TEXT NOT NULL,
  allocated_amount NUMERIC DEFAULT 0,
  disbursed_amount NUMERIC DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  escrow_adherence_pct NUMERIC DEFAULT 100,
  policy_objective TEXT,
  compliance_status TEXT DEFAULT 'compliant',
  misuse_risk_score INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.government_fund_compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage fund compliance" ON public.government_fund_compliance FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- DEVELOPER ECOSYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.ecosystem_developers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  organization_name TEXT NOT NULL,
  developer_type TEXT DEFAULT 'independent' CHECK (developer_type IN ('university','enterprise','independent','corporate','government_certified')),
  certification_status TEXT DEFAULT 'pending' CHECK (certification_status IN ('pending','sandbox','certified','suspended','revoked')),
  api_access_tier INTEGER DEFAULT 1 CHECK (api_access_tier BETWEEN 1 AND 4),
  node_scope TEXT[],
  risk_score INTEGER DEFAULT 0,
  api_key_hash TEXT,
  rate_limit_per_day INTEGER DEFAULT 1000,
  total_api_calls BIGINT DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ecosystem_developers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Devs view own record" ON public.ecosystem_developers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage devs" ON public.ecosystem_developers FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.ecosystem_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID REFERENCES public.ecosystem_developers(id),
  app_name TEXT NOT NULL,
  app_type TEXT DEFAULT 'analytics',
  description TEXT,
  certification_status TEXT DEFAULT 'pending' CHECK (certification_status IN ('pending','review','certified','rejected','suspended')),
  security_audit_passed BOOLEAN DEFAULT false,
  compliance_review_passed BOOLEAN DEFAULT false,
  bias_compliance_passed BOOLEAN DEFAULT false,
  data_sovereignty_checked BOOLEAN DEFAULT false,
  marketplace_listed BOOLEAN DEFAULT false,
  install_count INTEGER DEFAULT 0,
  ecosystem_fee_pct NUMERIC DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ecosystem_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apps publicly browsable" ON public.ecosystem_apps FOR SELECT USING (marketplace_listed = true);
CREATE POLICY "Admins manage apps" ON public.ecosystem_apps FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.ecosystem_revenue_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID REFERENCES public.ecosystem_developers(id),
  app_id UUID REFERENCES public.ecosystem_apps(id),
  amount NUMERIC NOT NULL,
  revenue_type TEXT DEFAULT 'commission',
  platform_share NUMERIC,
  developer_share NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ecosystem_revenue_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view eco revenue" ON public.ecosystem_revenue_logs FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================
-- SUPREMACY UPGRADE — PERFORMANCE & HARDENING
-- ============================================

CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  endpoint TEXT,
  query_latency_ms NUMERIC,
  cache_hit_rate NUMERIC,
  db_load_pct NUMERIC,
  memory_usage_mb NUMERIC,
  api_response_time_ms NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view perf metrics" ON public.performance_metrics FOR SELECT USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.capital_velocity_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID,
  avg_deal_cycle_days NUMERIC,
  avg_escrow_hold_hours NUMERIC,
  dispute_delay_hours NUMERIC,
  capital_idle_pct NUMERIC,
  release_frequency_per_week NUMERIC,
  velocity_score INTEGER DEFAULT 50,
  period TEXT,
  computed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.capital_velocity_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view capital velocity" ON public.capital_velocity_index FOR SELECT USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.trust_weighting_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_version INTEGER NOT NULL,
  verification_weight NUMERIC DEFAULT 0.3,
  projects_weight NUMERIC DEFAULT 0.2,
  delivery_weight NUMERIC DEFAULT 0.15,
  dispute_weight NUMERIC DEFAULT 0.15,
  financial_weight NUMERIC DEFAULT 0.15,
  rating_weight NUMERIC DEFAULT 0.05,
  bias_audit_date TIMESTAMPTZ,
  bias_audit_result TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.trust_weighting_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage trust config" ON public.trust_weighting_config FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.retention_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  churn_risk_pct NUMERIC DEFAULT 0,
  dropout_risk_pct NUMERIC DEFAULT 0,
  disengagement_risk_pct NUMERIC DEFAULT 0,
  capital_withdrawal_risk_pct NUMERIC DEFAULT 0,
  nudge_sent BOOLEAN DEFAULT false,
  nudge_type TEXT,
  predicted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.retention_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view retention" ON public.retention_predictions FOR SELECT USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.data_moat_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_projects BIGINT DEFAULT 0,
  unique_capital_flows BIGINT DEFAULT 0,
  unique_arbitration_cases BIGINT DEFAULT 0,
  unique_startup_lifecycles BIGINT DEFAULT 0,
  unique_employment_transitions BIGINT DEFAULT 0,
  compounding_score NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.data_moat_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view moat metrics" ON public.data_moat_metrics FOR SELECT USING (public.is_admin(auth.uid()));
