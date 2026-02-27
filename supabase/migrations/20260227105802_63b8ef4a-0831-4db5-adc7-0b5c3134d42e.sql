
-- =====================================================
-- CAPITAL MOBILIZATION & ESCROW INTELLIGENCE ENGINE (CMEIE)
-- =====================================================

-- 1. Funding Campaigns (Section 1)
CREATE TABLE IF NOT EXISTS public.cmeie_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  problem_statement TEXT,
  domain TEXT,
  geographic_scope TEXT DEFAULT 'local',
  funding_goal NUMERIC NOT NULL DEFAULT 0,
  funds_pledged NUMERIC DEFAULT 0,
  funds_escrowed NUMERIC DEFAULT 0,
  funds_released NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  milestone_breakdown JSONB DEFAULT '[]',
  timeline_start TIMESTAMPTZ,
  timeline_end TIMESTAMPTZ,
  deliverables TEXT[] DEFAULT '{}',
  governance_structure JSONB DEFAULT '{}',
  compliance_requirements TEXT[] DEFAULT '{}',
  escrow_release_structure JSONB DEFAULT '{}',
  risk_factors TEXT[] DEFAULT '{}',
  expected_outcomes TEXT[] DEFAULT '{}',
  institutional_backing UUID,
  privacy_level TEXT DEFAULT 'public',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Campaign Contributions (Section 2 & 7)
CREATE TABLE IF NOT EXISTS public.cmeie_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  contribution_type TEXT DEFAULT 'monetary',
  escrow_locked BOOLEAN DEFAULT true,
  milestone_specific_id UUID,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval TEXT,
  institutional_cofund BOOLEAN DEFAULT false,
  matching_pool_id UUID,
  status TEXT DEFAULT 'escrowed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Donor Intelligence (Section 3)
CREATE TABLE IF NOT EXISTS public.cmeie_donor_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  organizer_trust_index NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  past_completion_rate NUMERIC DEFAULT 0,
  dispute_history_score NUMERIC DEFAULT 0,
  institutional_backing_score NUMERIC DEFAULT 0,
  domain_authority NUMERIC DEFAULT 0,
  risk_assessment JSONB DEFAULT '{}',
  compliance_status TEXT DEFAULT 'pending',
  cross_border_eligible BOOLEAN DEFAULT true,
  composite_confidence NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id)
);

-- 4. Funding Risk Assessment (Section 4)
CREATE TABLE IF NOT EXISTS public.cmeie_risk_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  execution_risk NUMERIC DEFAULT 0,
  funding_volatility_risk NUMERIC DEFAULT 0,
  compliance_risk NUMERIC DEFAULT 0,
  institutional_stability_risk NUMERIC DEFAULT 0,
  cross_border_regulatory_risk NUMERIC DEFAULT 0,
  deliverable_feasibility NUMERIC DEFAULT 0,
  team_trust_density NUMERIC DEFAULT 0,
  milestone_punctuality NUMERIC DEFAULT 0,
  domain_maturity NUMERIC DEFAULT 0,
  composite_risk NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id)
);

-- 5. Cross-Border Compliance (Section 5)
CREATE TABLE IF NOT EXISTS public.cmeie_cross_border (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  contributor_jurisdiction TEXT,
  funding_restrictions TEXT[] DEFAULT '{}',
  currency_regulation_status TEXT DEFAULT 'unchecked',
  sanction_screening_clear BOOLEAN DEFAULT false,
  export_control_clear BOOLEAN DEFAULT false,
  data_transfer_compliant BOOLEAN DEFAULT false,
  institutional_approval_required BOOLEAN DEFAULT false,
  flags TEXT[] DEFAULT '{}',
  overall_clearance NUMERIC DEFAULT 0,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Fraud Detection (Section 8)
CREATE TABLE IF NOT EXISTS public.cmeie_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  contribution_id UUID REFERENCES public.cmeie_contributions(id) ON DELETE CASCADE,
  flagged_user_id UUID,
  flag_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  evidence JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Funding Performance Index (Section 9)
CREATE TABLE IF NOT EXISTS public.cmeie_performance_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  milestone_punctuality NUMERIC DEFAULT 0,
  budget_adherence NUMERIC DEFAULT 0,
  deliverable_validation_rate NUMERIC DEFAULT 0,
  donor_satisfaction NUMERIC DEFAULT 0,
  institutional_endorsement NUMERIC DEFAULT 0,
  long_term_impact NUMERIC DEFAULT 0,
  cross_border_stability NUMERIC DEFAULT 0,
  economic_multiplier NUMERIC DEFAULT 0,
  composite_performance NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id)
);

-- 8. Startup Capital Raise (Section 12)
CREATE TABLE IF NOT EXISTS public.cmeie_startup_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  round_type TEXT DEFAULT 'pre_seed',
  target_raise NUMERIC DEFAULT 0,
  raised_amount NUMERIC DEFAULT 0,
  equity_offered NUMERIC DEFAULT 0,
  convertible_structure JSONB DEFAULT '{}',
  investor_accreditation_required BOOLEAN DEFAULT false,
  escrow_staged BOOLEAN DEFAULT true,
  performance_linked_release BOOLEAN DEFAULT true,
  governance_rights JSONB DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Long-Term Impact Tracking (Section 14)
CREATE TABLE IF NOT EXISTS public.cmeie_impact_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cmeie_campaigns(id) ON DELETE CASCADE,
  deliverables_completed INTEGER DEFAULT 0,
  innovation_output INTEGER DEFAULT 0,
  patent_filings INTEGER DEFAULT 0,
  startup_survival_rate NUMERIC DEFAULT 0,
  industry_deployments INTEGER DEFAULT 0,
  economic_impact_estimate NUMERIC DEFAULT 0,
  policy_influence_score NUMERIC DEFAULT 0,
  cross_border_expansions INTEGER DEFAULT 0,
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id)
);

-- Enable RLS
ALTER TABLE public.cmeie_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_donor_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_risk_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_cross_border ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_performance_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_startup_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmeie_impact_tracking ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read cmeie_campaigns" ON public.cmeie_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_contrib" ON public.cmeie_contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_donor" ON public.cmeie_donor_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_risk" ON public.cmeie_risk_assessment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_xborder" ON public.cmeie_cross_border FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_fraud" ON public.cmeie_fraud_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_perf" ON public.cmeie_performance_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_startup" ON public.cmeie_startup_rounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cmeie_impact" ON public.cmeie_impact_tracking FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert cmeie_campaigns" ON public.cmeie_campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_contrib" ON public.cmeie_contributions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_donor" ON public.cmeie_donor_intelligence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_risk" ON public.cmeie_risk_assessment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_xborder" ON public.cmeie_cross_border FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_fraud" ON public.cmeie_fraud_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_perf" ON public.cmeie_performance_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_startup" ON public.cmeie_startup_rounds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cmeie_impact" ON public.cmeie_impact_tracking FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update cmeie_campaigns" ON public.cmeie_campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update cmeie_contrib" ON public.cmeie_contributions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update cmeie_fraud" ON public.cmeie_fraud_flags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update cmeie_startup" ON public.cmeie_startup_rounds FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update cmeie_perf" ON public.cmeie_performance_index FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update cmeie_impact" ON public.cmeie_impact_tracking FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update cmeie_donor" ON public.cmeie_donor_intelligence FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update cmeie_risk" ON public.cmeie_risk_assessment FOR UPDATE TO authenticated USING (true);
