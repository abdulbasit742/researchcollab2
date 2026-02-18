
-- Research Domination Engine: funding requests, quality scores, gap finder, corporate marketplace, impact index, employability

-- 1. Research Funding Requests (Fund This Research)
CREATE TABLE public.research_funding_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID,
  requester_id UUID,
  title TEXT NOT NULL,
  estimated_budget NUMERIC DEFAULT 0,
  timeline_weeks INTEGER DEFAULT 12,
  team_size INTEGER DEFAULT 1,
  milestone_structure JSONB DEFAULT '[]'::jsonb,
  risk_probability NUMERIC DEFAULT 0,
  survival_forecast NUMERIC DEFAULT 0,
  ip_preference TEXT DEFAULT 'shared',
  escrow_deposit_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open',
  sponsor_id UUID,
  funded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_funding_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open funding requests" ON public.research_funding_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create funding requests" ON public.research_funding_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners can update their requests" ON public.research_funding_requests FOR UPDATE USING (auth.uid() = requester_id);

-- 2. Research Quality Intelligence (Execution Credibility Index)
CREATE TABLE public.research_quality_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID,
  researcher_id UUID,
  completion_consistency NUMERIC DEFAULT 0,
  peer_validation_score NUMERIC DEFAULT 0,
  sponsor_feedback_score NUMERIC DEFAULT 0,
  milestone_discipline NUMERIC DEFAULT 0,
  citation_growth_rate NUMERIC DEFAULT 0,
  industry_engagement NUMERIC DEFAULT 0,
  replication_success NUMERIC DEFAULT 0,
  execution_credibility_index NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_quality_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view quality scores" ON public.research_quality_scores FOR SELECT USING (true);

-- 3. Research Gap Finder Results
CREATE TABLE public.research_gap_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gap_title TEXT NOT NULL,
  gap_description TEXT,
  sector TEXT,
  citation_density_gap NUMERIC DEFAULT 0,
  underinvestment_score NUMERIC DEFAULT 0,
  corporate_demand_signals INTEGER DEFAULT 0,
  government_priority_score NUMERIC DEFAULT 0,
  opportunity_score NUMERIC DEFAULT 0,
  related_clusters JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'identified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_gap_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gap findings" ON public.research_gap_findings FOR SELECT USING (true);

-- 4. Corporate Research Marketplace
CREATE TABLE public.corporate_research_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_id UUID,
  corporate_name TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  problem_description TEXT,
  budget_min NUMERIC DEFAULT 0,
  budget_max NUMERIC DEFAULT 0,
  ip_preference TEXT DEFAULT 'corporate_owned',
  timeline_weeks INTEGER DEFAULT 24,
  sector TEXT,
  risk_score NUMERIC DEFAULT 0,
  escrow_deposited BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'open',
  matched_university_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.corporate_research_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open problems" ON public.corporate_research_problems FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create problems" ON public.corporate_research_problems FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Research Impact Index
CREATE TABLE public.research_impact_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID,
  citation_count INTEGER DEFAULT 0,
  industry_adoption_count INTEGER DEFAULT 0,
  funding_volume NUMERIC DEFAULT 0,
  startup_spinoffs INTEGER DEFAULT 0,
  employment_created INTEGER DEFAULT 0,
  followon_capital NUMERIC DEFAULT 0,
  patents_generated INTEGER DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  survival_probability NUMERIC DEFAULT 0,
  impact_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_impact_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view impact index" ON public.research_impact_index FOR SELECT USING (true);

-- 6. Research Employability Link
CREATE TABLE public.research_employability_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID,
  researcher_id UUID,
  industry_relevance NUMERIC DEFAULT 0,
  sponsor_involvement NUMERIC DEFAULT 0,
  deliverable_quality NUMERIC DEFAULT 0,
  trust_score NUMERIC DEFAULT 0,
  skill_match_demand NUMERIC DEFAULT 0,
  employment_conversion_probability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_employability_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view employability scores" ON public.research_employability_scores FOR SELECT USING (true);

-- 7. Research Lifecycle Tracking
CREATE TABLE public.research_lifecycle_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID,
  current_stage TEXT DEFAULT 'discovery',
  stage_history JSONB DEFAULT '[]'::jsonb,
  prototype_started_at TIMESTAMPTZ,
  startup_formed_at TIMESTAMPTZ,
  equity_formed_at TIMESTAMPTZ,
  corporate_coinvestment BOOLEAN DEFAULT false,
  exit_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_lifecycle_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lifecycle stages" ON public.research_lifecycle_stages FOR SELECT USING (true);

-- 8. Research Intelligence Reports (monetizable)
CREATE TABLE public.research_intelligence_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_title TEXT NOT NULL,
  report_type TEXT DEFAULT 'sector_heatmap',
  sector TEXT,
  content_summary TEXT,
  full_report_url TEXT,
  access_tier TEXT DEFAULT 'premium',
  price_pkr NUMERIC DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_intelligence_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published reports" ON public.research_intelligence_reports FOR SELECT USING (published_at IS NOT NULL);
