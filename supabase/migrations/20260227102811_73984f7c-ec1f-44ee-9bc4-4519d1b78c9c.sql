
-- =====================================================
-- GLOBAL TALENT LIQUIDITY & SKILL MARKET ENGINE (GTL-SME)
-- =====================================================

-- 1. Skill Demand Heatmap (Section 1)
CREATE TABLE IF NOT EXISTS public.skill_demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  signal_source TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  demand_intensity NUMERIC DEFAULT 0,
  region TEXT,
  domain TEXT,
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Talent Liquidity Score (Section 2)
CREATE TABLE IF NOT EXISTS public.talent_liquidity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_strength NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  collaboration_trust NUMERIC DEFAULT 0,
  funding_experience NUMERIC DEFAULT 0,
  industry_integration NUMERIC DEFAULT 0,
  cross_domain_adaptability NUMERIC DEFAULT 0,
  compliance_integrity NUMERIC DEFAULT 0,
  response_reliability NUMERIC DEFAULT 0,
  time_to_deliver_efficiency NUMERIC DEFAULT 0,
  composite_tls NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Opportunity Matches (Section 3)
CREATE TABLE IF NOT EXISTS public.talent_opportunity_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opportunity_id UUID,
  opportunity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  skill_overlap_pct NUMERIC DEFAULT 0,
  domain_match NUMERIC DEFAULT 0,
  execution_threshold NUMERIC DEFAULT 0,
  geographic_compat NUMERIC DEFAULT 0,
  funding_eligibility NUMERIC DEFAULT 0,
  industry_alignment NUMERIC DEFAULT 0,
  collab_compat NUMERIC DEFAULT 0,
  historical_similarity NUMERIC DEFAULT 0,
  risk_alignment NUMERIC DEFAULT 0,
  composite_match NUMERIC DEFAULT 0,
  match_explanation TEXT,
  status TEXT DEFAULT 'pending',
  selection_probability NUMERIC DEFAULT 0,
  expected_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Micro Talent Tasks (Section 4)
CREATE TABLE IF NOT EXISTS public.micro_talent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_opportunity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  skill_tags TEXT[] DEFAULT '{}',
  domain TEXT,
  estimated_hours NUMERIC DEFAULT 0,
  budget NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  escrow_required BOOLEAN DEFAULT true,
  posted_by UUID NOT NULL,
  assigned_to UUID,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 5. Cross-Border Deployment (Section 5)
CREATE TABLE IF NOT EXISTS public.cross_border_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID NOT NULL,
  contractor_id UUID,
  source_country TEXT NOT NULL,
  target_country TEXT NOT NULL,
  currency_from TEXT NOT NULL,
  currency_to TEXT NOT NULL,
  jurisdiction_compliant BOOLEAN DEFAULT false,
  ip_ownership_clarity BOOLEAN DEFAULT false,
  escrow_id UUID,
  contract_template TEXT,
  tax_guidance_notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Skill Supply-Demand Analytics (Section 6)
CREATE TABLE IF NOT EXISTS public.skill_supply_demand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  region TEXT,
  domain TEXT,
  supply_count INTEGER DEFAULT 0,
  demand_count INTEGER DEFAULT 0,
  supply_demand_ratio NUMERIC DEFAULT 0,
  funding_alignment NUMERIC DEFAULT 0,
  trend_direction TEXT DEFAULT 'stable',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(skill_name, region, domain)
);

-- 7. Opportunity Fraud Flags (Section 8)
CREATE TABLE IF NOT EXISTS public.opportunity_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID,
  flag_type TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'low',
  resolved BOOLEAN DEFAULT false,
  flagged_by UUID,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Liquidity Stability Monitor (Section 12)
CREATE TABLE IF NOT EXISTS public.liquidity_stability_monitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  income_volatility NUMERIC DEFAULT 0,
  sponsor_dependency NUMERIC DEFAULT 0,
  domain_concentration_risk NUMERIC DEFAULT 0,
  collaboration_overexposure NUMERIC DEFAULT 0,
  funding_instability NUMERIC DEFAULT 0,
  execution_overload_risk NUMERIC DEFAULT 0,
  stability_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 9. Execution History Resume (Section 14)
CREATE TABLE IF NOT EXISTS public.execution_resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  completed_milestones INTEGER DEFAULT 0,
  delivered_projects INTEGER DEFAULT 0,
  funding_managed NUMERIC DEFAULT 0,
  patents_filed INTEGER DEFAULT 0,
  startups_launched INTEGER DEFAULT 0,
  industry_deployments INTEGER DEFAULT 0,
  compliance_record_score NUMERIC DEFAULT 0,
  collaboration_trust_score NUMERIC DEFAULT 0,
  resume_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.skill_demand_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_liquidity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_opportunity_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_talent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_supply_demand ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_stability_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_resume ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth read skill_demand" ON public.skill_demand_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read tls" ON public.talent_liquidity_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own read matches" ON public.talent_opportunity_matches FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read micro_tasks" ON public.micro_talent_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own read contracts" ON public.cross_border_contracts FOR SELECT TO authenticated USING (auth.uid() = initiator_id OR auth.uid() = contractor_id);
CREATE POLICY "Auth read supply_demand" ON public.skill_supply_demand FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read fraud_flags" ON public.opportunity_fraud_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own read stability" ON public.liquidity_stability_monitor FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read exec_resume" ON public.execution_resume FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Own insert tls" ON public.talent_liquidity_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update tls" ON public.talent_liquidity_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert matches" ON public.talent_opportunity_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert micro_tasks" ON public.micro_talent_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Auth insert contracts" ON public.cross_border_contracts FOR INSERT TO authenticated WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "Auth insert fraud" ON public.opportunity_fraud_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Own insert stability" ON public.liquidity_stability_monitor FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update stability" ON public.liquidity_stability_monitor FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert resume" ON public.execution_resume FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update resume" ON public.execution_resume FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert demand" ON public.skill_demand_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert supply_demand" ON public.skill_supply_demand FOR INSERT TO authenticated WITH CHECK (true);
