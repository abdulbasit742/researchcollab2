
-- =====================================================
-- PROMPT 11: GLOBAL RESEARCH ECONOMY & INNOVATION INTELLIGENCE ENGINE (GREIIE)
-- =====================================================

-- 1. National Innovation Efficiency Index
CREATE TABLE IF NOT EXISTS public.national_innovation_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  period TEXT NOT NULL,
  total_research_funding NUMERIC DEFAULT 0,
  total_publications INTEGER DEFAULT 0,
  patent_output INTEGER DEFAULT 0,
  commercialization_revenue NUMERIC DEFAULT 0,
  startup_formation_rate NUMERIC DEFAULT 0,
  venture_funding_attracted NUMERIC DEFAULT 0,
  industry_adoption_rate NUMERIC DEFAULT 0,
  policy_citation_impact NUMERIC DEFAULT 0,
  grant_completion_reliability NUMERIC DEFAULT 0,
  compliance_integrity NUMERIC DEFAULT 0,
  population BIGINT DEFAULT 0,
  gdp NUMERIC DEFAULT 0,
  niei_score NUMERIC DEFAULT 0,
  niei_per_capita NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Research Capital Flows
CREATE TABLE IF NOT EXISTS public.research_capital_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  domain TEXT,
  flow_type TEXT NOT NULL DEFAULT 'grant',
  amount NUMERIC NOT NULL DEFAULT 0,
  funding_source_type TEXT DEFAULT 'public',
  period TEXT NOT NULL,
  collaboration_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Domain Dominance Profiles
CREATE TABLE IF NOT EXISTS public.domain_dominance_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  domain TEXT NOT NULL,
  period TEXT NOT NULL,
  funding_concentration NUMERIC DEFAULT 0,
  publication_share NUMERIC DEFAULT 0,
  patent_share NUMERIC DEFAULT 0,
  commercialization_share NUMERIC DEFAULT 0,
  startup_share NUMERIC DEFAULT 0,
  talent_concentration NUMERIC DEFAULT 0,
  is_emerging_leader BOOLEAN DEFAULT false,
  is_declining BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Research Labor Market
CREATE TABLE IF NOT EXISTS public.research_labor_market (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  domain TEXT,
  period TEXT NOT NULL,
  phd_production INTEGER DEFAULT 0,
  graduate_industry_placement_pct NUMERIC DEFAULT 0,
  researcher_inflow INTEGER DEFAULT 0,
  researcher_outflow INTEGER DEFAULT 0,
  brain_drain_index NUMERIC DEFAULT 0,
  talent_concentration_index NUMERIC DEFAULT 0,
  funding_driven_migration_pct NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Global Innovation Competition Index
CREATE TABLE IF NOT EXISTS public.innovation_competition_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  period TEXT NOT NULL,
  funding_growth_rate NUMERIC DEFAULT 0,
  patent_velocity NUMERIC DEFAULT 0,
  commercialization_speed NUMERIC DEFAULT 0,
  startup_survival_rate NUMERIC DEFAULT 0,
  venture_capital_alignment NUMERIC DEFAULT 0,
  industry_integration_density NUMERIC DEFAULT 0,
  collaboration_stability NUMERIC DEFAULT 0,
  research_to_market_velocity NUMERIC DEFAULT 0,
  regulatory_compliance_maturity NUMERIC DEFAULT 0,
  overall_competition_score NUMERIC DEFAULT 0,
  global_rank INTEGER,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Research Capital Risk Signals
CREATE TABLE IF NOT EXISTS public.research_capital_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  risk_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  evidence JSONB DEFAULT '{}',
  trend_direction TEXT DEFAULT 'stable',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Funding Allocation Simulations
CREATE TABLE IF NOT EXISTS public.funding_allocation_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  simulation_name TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  predicted_innovation_yield NUMERIC DEFAULT 0,
  predicted_patent_output NUMERIC DEFAULT 0,
  predicted_startup_formation NUMERIC DEFAULT 0,
  predicted_policy_influence NUMERIC DEFAULT 0,
  predicted_economic_growth NUMERIC DEFAULT 0,
  explanation JSONB DEFAULT '{}',
  simulated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Innovation Network Graph Edges
CREATE TABLE IF NOT EXISTS public.innovation_network_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  weight NUMERIC DEFAULT 0,
  funding_amount NUMERIC DEFAULT 0,
  collaboration_reliability NUMERIC DEFAULT 0,
  patent_co_ownership INTEGER DEFAULT 0,
  startup_co_formation INTEGER DEFAULT 0,
  policy_alignment NUMERIC DEFAULT 0,
  period TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.national_innovation_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_capital_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_dominance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_labor_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_competition_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_capital_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_allocation_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_network_edges ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read
CREATE POLICY "Auth read national_innovation" ON public.national_innovation_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read capital_flows" ON public.research_capital_flows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read domain_dominance" ON public.domain_dominance_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read labor_market" ON public.research_labor_market FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read competition_index" ON public.innovation_competition_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read capital_risks" ON public.research_capital_risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read simulations" ON public.funding_allocation_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read network_edges" ON public.innovation_network_edges FOR SELECT TO authenticated USING (true);

-- RLS: Auth insert
CREATE POLICY "Auth insert national_innovation" ON public.national_innovation_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert capital_flows" ON public.research_capital_flows FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert domain_dominance" ON public.domain_dominance_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert labor_market" ON public.research_labor_market FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert competition_index" ON public.innovation_competition_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert capital_risks" ON public.research_capital_risks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert simulations" ON public.funding_allocation_simulations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert network_edges" ON public.innovation_network_edges FOR INSERT TO authenticated WITH CHECK (true);

-- Public read for macro intelligence
CREATE POLICY "Anon read national_innovation" ON public.national_innovation_index FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read competition_index" ON public.innovation_competition_index FOR SELECT TO anon USING (true);
