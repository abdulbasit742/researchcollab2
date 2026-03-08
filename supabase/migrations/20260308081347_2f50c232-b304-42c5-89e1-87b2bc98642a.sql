
-- Revenue Opportunities (detected by AI)
CREATE TABLE public.revenue_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('funding','commercialization','startup','hiring','licensing','partnership')),
  title TEXT NOT NULL,
  description TEXT,
  source_entity_type TEXT, -- project, research, user, institution
  source_entity_id UUID,
  target_entity_type TEXT,
  target_entity_id UUID,
  confidence_score NUMERIC DEFAULT 0,
  estimated_value NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected','reviewed','actioned','dismissed','expired')),
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Commercialization Paths
CREATE TABLE public.commercialization_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_project_id UUID,
  source_user_id UUID,
  path_type TEXT NOT NULL CHECK (path_type IN ('startup','licensing','industry_partnership','sponsored_project','consulting','product')),
  title TEXT NOT NULL,
  description TEXT,
  market_potential_score NUMERIC DEFAULT 0,
  readiness_score NUMERIC DEFAULT 0,
  recommended_steps JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','in_progress','completed','abandoned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsor Matches (AI-generated)
CREATE TABLE public.sponsor_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID,
  target_type TEXT NOT NULL CHECK (target_type IN ('project','researcher','institution','problem','lab')),
  target_id UUID NOT NULL,
  match_score NUMERIC DEFAULT 0,
  match_reasons JSONB DEFAULT '[]',
  domain_alignment NUMERIC DEFAULT 0,
  funding_fit NUMERIC DEFAULT 0,
  execution_fit NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','viewed','contacted','funded','dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Problem Proposals (research proposals for global problems)
CREATE TABLE public.problem_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.global_problems(id),
  proposer_id UUID NOT NULL,
  institution_id UUID,
  title TEXT NOT NULL,
  approach_summary TEXT,
  estimated_budget NUMERIC DEFAULT 0,
  estimated_timeline_months INTEGER DEFAULT 6,
  team_size INTEGER DEFAULT 1,
  required_skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','approved','funded','rejected','completed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Problem Funding Pools
CREATE TABLE public.problem_funding_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.global_problems(id),
  sponsor_id UUID NOT NULL,
  pool_name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC GENERATED ALWAYS AS (total_amount - allocated_amount) STORED,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','depleted','closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS on all new tables
ALTER TABLE public.revenue_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercialization_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_funding_pools ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users can read all (advisory data)
CREATE POLICY "Authenticated read revenue_opportunities" ON public.revenue_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read commercialization_paths" ON public.commercialization_paths FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read sponsor_matches" ON public.sponsor_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read problem_proposals" ON public.problem_proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read problem_funding_pools" ON public.problem_funding_pools FOR SELECT TO authenticated USING (true);

-- Insert policies for authenticated users
CREATE POLICY "Authenticated insert revenue_opportunities" ON public.revenue_opportunities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert commercialization_paths" ON public.commercialization_paths FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert sponsor_matches" ON public.sponsor_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert problem_proposals" ON public.problem_proposals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated insert problem_funding_pools" ON public.problem_funding_pools FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Authenticated update revenue_opportunities" ON public.revenue_opportunities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update commercialization_paths" ON public.commercialization_paths FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update sponsor_matches" ON public.sponsor_matches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update problem_proposals" ON public.problem_proposals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated update problem_funding_pools" ON public.problem_funding_pools FOR UPDATE TO authenticated USING (true);
