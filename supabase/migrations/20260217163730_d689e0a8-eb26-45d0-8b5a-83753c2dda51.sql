
-- =============================================
-- CORPORATE R&D INFRASTRUCTURE
-- =============================================

CREATE TABLE public.corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  annual_rnd_budget NUMERIC DEFAULT 0,
  allocated_budget NUMERIC DEFAULT 0,
  remaining_budget NUMERIC DEFAULT 0,
  contract_type TEXT DEFAULT 'annual' CHECK (contract_type IN ('annual', 'multi-year')),
  governance_level TEXT DEFAULT 'standard',
  account_manager TEXT,
  country_id UUID REFERENCES public.countries(id),
  status TEXT DEFAULT 'active',
  commission_discount_pct NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.corporate_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage corporate accounts" ON public.corporate_accounts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Corporate members view own" ON public.corporate_accounts FOR SELECT USING (created_by = auth.uid());

CREATE TABLE public.corporate_governance_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID REFERENCES public.corporate_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('innovation_director', 'budget_controller', 'technical_reviewer', 'hiring_manager')),
  granted_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(corporate_id, user_id, role)
);
ALTER TABLE public.corporate_governance_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage corp roles" ON public.corporate_governance_roles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Members view own corp roles" ON public.corporate_governance_roles FOR SELECT USING (user_id = auth.uid());

CREATE TABLE public.innovation_pipeline_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID REFERENCES public.corporate_accounts(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sector TEXT,
  innovation_theme TEXT,
  budget_allocated NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'matched', 'in_progress', 'completed', 'cancelled')),
  matched_university_id UUID,
  matched_fyp_id UUID,
  risk_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.innovation_pipeline_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage briefs" ON public.innovation_pipeline_briefs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Corp members view briefs" ON public.innovation_pipeline_briefs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_governance_roles WHERE corporate_id = innovation_pipeline_briefs.corporate_id AND user_id = auth.uid() AND is_active = true)
);

CREATE TABLE public.corporate_hiring_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID REFERENCES public.corporate_accounts(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  fyp_id UUID,
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'tagged', 'talent_pool', 'interview_invited', 'hired', 'declined')),
  performance_score NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.corporate_hiring_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage hiring" ON public.corporate_hiring_pipeline FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Corp members view hiring" ON public.corporate_hiring_pipeline FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.corporate_governance_roles WHERE corporate_id = corporate_hiring_pipeline.corporate_id AND user_id = auth.uid() AND is_active = true)
);

-- =============================================
-- SPIN-OFF & EQUITY INFRASTRUCTURE
-- =============================================

CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  originating_fyp_id UUID,
  founding_team JSONB DEFAULT '[]',
  equity_structure JSONB DEFAULT '{}',
  valuation_basis TEXT,
  incubation_status TEXT DEFAULT 'idea' CHECK (incubation_status IN ('idea', 'prototype', 'validated', 'incorporated', 'fundraising', 'scaling', 'exit')),
  university_id UUID,
  country_id UUID REFERENCES public.countries(id),
  sector TEXT,
  revenue NUMERIC DEFAULT 0,
  follow_on_funding NUMERIC DEFAULT 0,
  hiring_count INTEGER DEFAULT 0,
  product_stage TEXT,
  eligibility_score NUMERIC DEFAULT 0,
  platform_equity_pct NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage startups" ON public.startups FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Founders view own startups" ON public.startups FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Public view startups" ON public.startups FOR SELECT USING (incubation_status NOT IN ('idea'));

CREATE TABLE public.cap_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  stakeholder_id UUID,
  stakeholder_name TEXT,
  stakeholder_role TEXT CHECK (stakeholder_role IN ('founder', 'university', 'platform', 'sponsor', 'investor', 'advisor')),
  equity_percentage NUMERIC NOT NULL DEFAULT 0,
  vesting_terms JSONB DEFAULT '{}',
  lock_in_period_months INTEGER DEFAULT 0,
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.cap_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage cap tables" ON public.cap_tables FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Stakeholders view own equity" ON public.cap_tables FOR SELECT USING (stakeholder_id = auth.uid());

CREATE TABLE public.cap_table_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  cap_table_entry_id UUID REFERENCES public.cap_tables(id),
  action TEXT NOT NULL,
  previous_equity NUMERIC,
  new_equity NUMERIC,
  changed_by UUID,
  legal_reference TEXT,
  approval_signatures JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.cap_table_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view cap audits" ON public.cap_table_audit_logs FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.investor_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  investor_type TEXT DEFAULT 'individual' CHECK (investor_type IN ('individual', 'institutional', 'corporate', 'government')),
  verified BOOLEAN DEFAULT false,
  accreditation_status TEXT DEFAULT 'pending',
  investment_focus TEXT[] DEFAULT '{}',
  country_id UUID REFERENCES public.countries(id),
  total_invested NUMERIC DEFAULT 0,
  active_investments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.investor_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage investors" ON public.investor_accounts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Investors view own" ON public.investor_accounts FOR SELECT USING (user_id = auth.uid());

-- =============================================
-- MASS NATIONAL INFRASTRUCTURE
-- =============================================

CREATE TABLE public.university_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL,
  country_id UUID REFERENCES public.countries(id),
  tier TEXT DEFAULT 'C' CHECK (tier IN ('A', 'B', 'C')),
  completion_rate NUMERIC DEFAULT 0,
  funding_volume NUMERIC DEFAULT 0,
  ontime_pct NUMERIC DEFAULT 0,
  sponsor_rating NUMERIC DEFAULT 0,
  employment_conversion NUMERIC DEFAULT 0,
  growth_velocity NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.university_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage tiers" ON public.university_tiers FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated view tiers" ON public.university_tiers FOR SELECT TO authenticated USING (true);

CREATE TABLE public.national_innovation_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id) NOT NULL,
  total_funding NUMERIC DEFAULT 0,
  student_income NUMERIC DEFAULT 0,
  hiring_rate NUMERIC DEFAULT 0,
  startup_creation INTEGER DEFAULT 0,
  sector_diversification NUMERIC DEFAULT 0,
  regional_balance NUMERIC DEFAULT 0,
  composite_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.national_innovation_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage innovation index" ON public.national_innovation_index FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated view index" ON public.national_innovation_index FOR SELECT TO authenticated USING (true);

-- =============================================
-- PARTNER NETWORK INFRASTRUCTURE
-- =============================================

CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('corporate', 'accelerator', 'erp', 'incubator', 'ministry', 'ngo')),
  country_id UUID REFERENCES public.countries(id),
  integration_scope TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'under_review', 'approved', 'rejected', 'suspended')),
  access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 4),
  revenue_share_model TEXT DEFAULT 'flat_fee',
  compliance_status TEXT DEFAULT 'compliant',
  compliance_score NUMERIC DEFAULT 100,
  performance_score NUMERIC DEFAULT 0,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage partners" ON public.partners FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.partner_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  scope_permissions JSONB DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  expiration_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  last_used_at TIMESTAMPTZ,
  total_calls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage api keys" ON public.partner_api_keys FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.partner_revenue_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  revenue_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.partner_revenue_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage partner revenue" ON public.partner_revenue_logs FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- E2E OS - ECONOMIC IMPACT & LIFECYCLE
-- =============================================

CREATE TABLE public.economic_impact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('funding', 'escrow_release', 'employment_hire', 'spinoff_created', 'capital_allocation', 'revenue_declaration')),
  actor_id UUID,
  entity_id UUID,
  entity_type TEXT,
  amount NUMERIC DEFAULT 0,
  country_id UUID REFERENCES public.countries(id),
  sector TEXT,
  university_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.economic_impact_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage impact logs" ON public.economic_impact_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated view impact" ON public.economic_impact_logs FOR SELECT TO authenticated USING (true);

CREATE TABLE public.lifecycle_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_stage TEXT DEFAULT 'student' CHECK (current_stage IN ('student', 'project_contributor', 'project_lead', 'hired_professional', 'founder', 'employer', 'sponsor', 'capital_contributor')),
  previous_stage TEXT,
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  total_funding_handled NUMERIC DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  startups_founded INTEGER DEFAULT 0,
  employment_count INTEGER DEFAULT 0,
  mobility_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.lifecycle_progressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own lifecycle" ON public.lifecycle_progressions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage lifecycle" ON public.lifecycle_progressions FOR ALL USING (public.is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_corporate_accounts_country ON public.corporate_accounts(country_id);
CREATE INDEX idx_innovation_briefs_corporate ON public.innovation_pipeline_briefs(corporate_id);
CREATE INDEX idx_startups_country ON public.startups(country_id);
CREATE INDEX idx_startups_incubation ON public.startups(incubation_status);
CREATE INDEX idx_cap_tables_startup ON public.cap_tables(startup_id);
CREATE INDEX idx_university_tiers_country ON public.university_tiers(country_id);
CREATE INDEX idx_partners_status ON public.partners(approval_status);
CREATE INDEX idx_economic_impact_type ON public.economic_impact_logs(event_type);
CREATE INDEX idx_economic_impact_country ON public.economic_impact_logs(country_id);
CREATE INDEX idx_lifecycle_user ON public.lifecycle_progressions(user_id);
CREATE INDEX idx_hiring_pipeline_corporate ON public.corporate_hiring_pipeline(corporate_id);
