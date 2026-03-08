
-- Execution Exchange Contracts
CREATE TABLE public.execution_exchange_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  organization_id UUID,
  organization_name TEXT,
  contract_type TEXT NOT NULL DEFAULT 'execution' CHECK (contract_type IN ('execution','research','consulting','mentorship','review')),
  domain TEXT,
  required_skills TEXT[] DEFAULT '{}',
  min_trust_score NUMERIC DEFAULT 0,
  budget_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  milestone_count INTEGER DEFAULT 1,
  duration_months INTEGER DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','cancelled')),
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Institutional Talent Pools
CREATE TABLE public.institutional_talent_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID,
  pool_name TEXT NOT NULL,
  description TEXT,
  pool_type TEXT NOT NULL DEFAULT 'general' CHECK (pool_type IN ('general','students','researchers','engineers','postdocs','faculty')),
  domain TEXT,
  member_count INTEGER DEFAULT 0,
  avg_trust_score NUMERIC DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Talent Pool Members
CREATE TABLE public.talent_pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.institutional_talent_pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role_in_pool TEXT DEFAULT 'member',
  trust_score_snapshot NUMERIC DEFAULT 0,
  top_skills TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available','busy','unavailable')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pool_id, user_id)
);

-- Professional Opportunities (feed items)
CREATE TABLE public.professional_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('contract','research','collaboration','sponsored','fellowship','grant')),
  title TEXT NOT NULL,
  description TEXT,
  organization_name TEXT,
  domain TEXT,
  required_skills TEXT[] DEFAULT '{}',
  min_trust_score NUMERIC DEFAULT 0,
  budget_range_min NUMERIC DEFAULT 0,
  budget_range_max NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ,
  location TEXT DEFAULT 'Remote',
  is_active BOOLEAN DEFAULT true,
  source_contract_id UUID REFERENCES public.execution_exchange_contracts(id),
  posted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contract Applications
CREATE TABLE public.contract_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.execution_exchange_contracts(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL,
  cover_note TEXT,
  proposed_budget NUMERIC,
  proposed_timeline_months INTEGER,
  trust_score_snapshot NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','shortlisted','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(contract_id, applicant_id)
);

-- Enable RLS
ALTER TABLE public.execution_exchange_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_applications ENABLE ROW LEVEL SECURITY;

-- Read policies (authenticated)
CREATE POLICY "Auth read execution_exchange_contracts" ON public.execution_exchange_contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read institutional_talent_pools" ON public.institutional_talent_pools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read talent_pool_members" ON public.talent_pool_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read professional_opportunities" ON public.professional_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read contract_applications" ON public.contract_applications FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert execution_exchange_contracts" ON public.execution_exchange_contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert institutional_talent_pools" ON public.institutional_talent_pools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert talent_pool_members" ON public.talent_pool_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert professional_opportunities" ON public.professional_opportunities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert contract_applications" ON public.contract_applications FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update execution_exchange_contracts" ON public.execution_exchange_contracts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update institutional_talent_pools" ON public.institutional_talent_pools FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update talent_pool_members" ON public.talent_pool_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update professional_opportunities" ON public.professional_opportunities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update contract_applications" ON public.contract_applications FOR UPDATE TO authenticated USING (true);
