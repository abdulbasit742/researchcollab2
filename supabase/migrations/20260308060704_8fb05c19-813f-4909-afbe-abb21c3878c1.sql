
-- =============================================
-- INNOVATION REVENUE SYSTEMS — Additive Tables
-- =============================================

-- 1. Dataset Marketplace
CREATE TABLE public.dataset_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  institution_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  data_format TEXT,
  sample_available BOOLEAN DEFAULT false,
  record_count BIGINT,
  price_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  license_type TEXT DEFAULT 'research_only',
  tags TEXT[] DEFAULT '{}',
  download_count INT DEFAULT 0,
  rating_avg NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.dataset_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view active datasets" ON public.dataset_listings FOR SELECT TO authenticated USING (status = 'active' OR owner_id = auth.uid());
CREATE POLICY "Owners can insert datasets" ON public.dataset_listings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update datasets" ON public.dataset_listings FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.dataset_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.dataset_listings(id) NOT NULL,
  buyer_id UUID NOT NULL,
  amount_paid NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.dataset_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers see own purchases" ON public.dataset_purchases FOR SELECT TO authenticated USING (buyer_id = auth.uid());
CREATE POLICY "Authenticated can purchase" ON public.dataset_purchases FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

-- 2. Global Execution Index
CREATE TABLE public.global_execution_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- researcher, institution, lab, project
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  milestone_reliability NUMERIC DEFAULT 0,
  research_impact NUMERIC DEFAULT 0,
  funding_reliability NUMERIC DEFAULT 0,
  collaboration_success NUMERIC DEFAULT 0,
  composite_rank_score NUMERIC DEFAULT 0,
  global_rank INT,
  region TEXT,
  domain TEXT,
  computed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.global_execution_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view rankings" ON public.global_execution_rankings FOR SELECT TO authenticated USING (true);

-- 3. Execution Economy Analytics
CREATE TABLE public.execution_economy_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- productivity, capital_efficiency, talent_mobility, collaboration
  institution_id UUID,
  region TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics JSONB DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.execution_economy_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view reports" ON public.execution_economy_reports FOR SELECT TO authenticated USING (true);

-- 4. Global Talent Graph
CREATE TABLE public.talent_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  relationship_type TEXT NOT NULL, -- collaboration, co_research, mentorship, endorsement
  weight NUMERIC DEFAULT 1,
  shared_domains TEXT[] DEFAULT '{}',
  shared_projects INT DEFAULT 0,
  trust_weighted_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_user_id, target_user_id, relationship_type)
);
ALTER TABLE public.talent_graph_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view talent graph" ON public.talent_graph_edges FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert edges" ON public.talent_graph_edges FOR INSERT TO authenticated WITH CHECK (source_user_id = auth.uid());

-- 5. Innovation License Marketplace
CREATE TABLE public.innovation_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  institution_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  innovation_type TEXT NOT NULL, -- ai_model, biotech, hardware, software, dataset, patent
  license_model TEXT DEFAULT 'per_use', -- per_use, subscription, perpetual, royalty
  price_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  royalty_percentage NUMERIC,
  total_licenses_sold INT DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.innovation_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View active licenses" ON public.innovation_licenses FOR SELECT TO authenticated USING (status = 'active' OR owner_id = auth.uid());
CREATE POLICY "Owners insert licenses" ON public.innovation_licenses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update licenses" ON public.innovation_licenses FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.license_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.innovation_licenses(id) NOT NULL,
  buyer_id UUID NOT NULL,
  amount_paid NUMERIC NOT NULL,
  platform_commission NUMERIC DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.license_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers see own transactions" ON public.license_transactions FOR SELECT TO authenticated USING (buyer_id = auth.uid());
CREATE POLICY "Buyers can purchase" ON public.license_transactions FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

-- 6. Research Capital Market (extends beyond existing capital intelligence)
CREATE TABLE public.research_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name TEXT NOT NULL,
  description TEXT,
  fund_type TEXT DEFAULT 'research_pool', -- research_pool, challenge_fund, institutional_grant
  total_size NUMERIC DEFAULT 0,
  allocated_amount NUMERIC DEFAULT 0,
  available_amount NUMERIC DEFAULT 0,
  management_fee_pct NUMERIC DEFAULT 2.0,
  success_fee_pct NUMERIC DEFAULT 1.0,
  participating_institutions INT DEFAULT 0,
  active_projects INT DEFAULT 0,
  domain TEXT,
  region TEXT,
  status TEXT DEFAULT 'open',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.research_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View open funds" ON public.research_funds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators insert funds" ON public.research_funds FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators update funds" ON public.research_funds FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE TABLE public.fund_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.research_funds(id) NOT NULL,
  contributor_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  contributed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.fund_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributors see own" ON public.fund_contributions FOR SELECT TO authenticated USING (contributor_id = auth.uid());
CREATE POLICY "Authenticated can contribute" ON public.fund_contributions FOR INSERT TO authenticated WITH CHECK (contributor_id = auth.uid());

CREATE TABLE public.fund_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.research_funds(id) NOT NULL,
  project_id UUID,
  amount NUMERIC NOT NULL,
  allocation_reason TEXT,
  allocated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.fund_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view allocations" ON public.fund_allocations FOR SELECT TO authenticated USING (true);
