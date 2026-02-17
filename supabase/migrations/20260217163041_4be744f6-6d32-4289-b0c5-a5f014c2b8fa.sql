
-- STEP 1: National layer (countries first)
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  currency TEXT DEFAULT 'PKR',
  timezone TEXT DEFAULT 'Asia/Karachi',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Admins manage countries" ON public.countries FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.country_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE UNIQUE,
  default_ip_model TEXT DEFAULT 'shared',
  default_commission_rate NUMERIC(5,2) DEFAULT 10.00,
  escrow_rules JSONB DEFAULT '{}'::jsonb,
  compliance_standards JSONB DEFAULT '{}'::jsonb,
  dispute_protocol JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.country_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view country settings" ON public.country_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage country settings" ON public.country_settings FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.country_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID,
  UNIQUE(country_id, user_id)
);
ALTER TABLE public.country_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage country admins" ON public.country_admins FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Country admins can view own" ON public.country_admins FOR SELECT USING (auth.uid() = user_id);

-- PPP tables
CREATE TABLE public.government_grant_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  title TEXT NOT NULL,
  description TEXT,
  total_budget NUMERIC(14,2) NOT NULL DEFAULT 0,
  allocated_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  available_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  sector_focus TEXT[] DEFAULT '{}',
  innovation_priorities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.government_grant_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage grant pools" ON public.government_grant_pools FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth view active pools" ON public.government_grant_pools FOR SELECT TO authenticated USING (status IN ('open', 'active'));

CREATE TABLE public.grant_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.government_grant_pools(id) ON DELETE CASCADE,
  fyp_id UUID,
  university_id UUID,
  allocated_amount NUMERIC(14,2) NOT NULL,
  disbursed_amount NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  milestone_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grant_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage allocations" ON public.grant_allocations FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.fyp_compliance_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fyp_id UUID NOT NULL,
  sector_category TEXT,
  innovation_priority TEXT,
  national_goal_alignment TEXT,
  employment_impact TEXT,
  tagged_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fyp_compliance_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth view tags" ON public.fyp_compliance_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users tag own" ON public.fyp_compliance_tags FOR INSERT WITH CHECK (auth.uid() = tagged_by);
CREATE POLICY "Admins manage tags" ON public.fyp_compliance_tags FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.university_compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL UNIQUE,
  country_id UUID REFERENCES public.countries(id),
  milestone_completion_rate NUMERIC(5,2) DEFAULT 0,
  dispute_frequency NUMERIC(5,2) DEFAULT 0,
  escrow_adherence NUMERIC(5,2) DEFAULT 0,
  reporting_completeness NUMERIC(5,2) DEFAULT 0,
  funding_transparency NUMERIC(5,2) DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.university_compliance_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view compliance" ON public.university_compliance_scores FOR ALL USING (public.is_admin(auth.uid()));

-- Capital Pool tables
CREATE TABLE public.capital_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_id UUID REFERENCES public.countries(id),
  pool_type TEXT NOT NULL,
  total_committed NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_allocated NUMERIC(14,2) NOT NULL DEFAULT 0,
  available_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  risk_category TEXT DEFAULT 'moderate',
  governance_structure JSONB DEFAULT '{}'::jsonb,
  lifecycle_status TEXT NOT NULL DEFAULT 'raising',
  start_date DATE,
  end_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage capital pools" ON public.capital_pools FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth view active pools cp" ON public.capital_pools FOR SELECT TO authenticated USING (lifecycle_status IN ('raising', 'active'));

CREATE TABLE public.pool_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.capital_pools(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL,
  contributor_type TEXT NOT NULL,
  amount_committed NUMERIC(14,2) NOT NULL DEFAULT 0,
  amount_disbursed NUMERIC(14,2) NOT NULL DEFAULT 0,
  rights_type TEXT DEFAULT 'passive',
  reporting_access_level TEXT DEFAULT 'summary',
  joined_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pool_contributors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributors view own" ON public.pool_contributors FOR SELECT USING (auth.uid() = contributor_id);
CREATE POLICY "Admins manage contributors" ON public.pool_contributors FOR ALL USING (public.is_admin(auth.uid()));

-- Extend existing pool_allocations
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS capital_pool_id UUID REFERENCES public.capital_pools(id);
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS escrow_link_id UUID;
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE TABLE public.pool_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.capital_pools(id) ON DELETE CASCADE UNIQUE,
  milestone_success_rate NUMERIC(5,2) DEFAULT 0,
  on_time_delivery_pct NUMERIC(5,2) DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  employment_conversion_rate NUMERIC(5,2) DEFAULT 0,
  total_students_paid INTEGER DEFAULT 0,
  total_projects_funded INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pool_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view pool metrics" ON public.pool_performance_metrics FOR ALL USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_country_settings_cid ON public.country_settings(country_id);
CREATE INDEX idx_country_admins_cid ON public.country_admins(country_id);
CREATE INDEX idx_govt_grants_cid ON public.government_grant_pools(country_id);
CREATE INDEX idx_grant_alloc_pid ON public.grant_allocations(pool_id);
CREATE INDEX idx_capital_pools_cid ON public.capital_pools(country_id);
CREATE INDEX idx_pool_contrib_pid ON public.pool_contributors(pool_id);
CREATE INDEX idx_compliance_tags_fid ON public.fyp_compliance_tags(fyp_id);
