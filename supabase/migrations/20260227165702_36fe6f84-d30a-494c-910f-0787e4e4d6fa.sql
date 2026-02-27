
-- Execution Opportunities
CREATE TABLE public.execution_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type TEXT NOT NULL DEFAULT 'research_collab',
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  required_claim_ids UUID[] DEFAULT '{}',
  budget_range_min NUMERIC DEFAULT 0,
  budget_range_max NUMERIC DEFAULT 0,
  region_scope TEXT,
  trust_threshold NUMERIC DEFAULT 0,
  cross_border_allowed BOOLEAN DEFAULT true,
  team_formation_enabled BOOLEAN DEFAULT false,
  institutional_endorsement_required BOOLEAN DEFAULT false,
  compliance_tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'open',
  linked_funding_plan_id UUID,
  linked_policy_model_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closes_at TIMESTAMPTZ
);

ALTER TABLE public.execution_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator manages opportunities" ON public.execution_opportunities
  FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Public opportunities visible" ON public.execution_opportunities
  FOR SELECT USING (is_public = true AND status = 'open');

-- Opportunity Applications
CREATE TABLE public.opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.execution_opportunities(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID NOT NULL,
  application_text TEXT,
  matching_score NUMERIC DEFAULT 0,
  expertise_match NUMERIC DEFAULT 0,
  trust_match NUMERIC DEFAULT 0,
  claim_match NUMERIC DEFAULT 0,
  cross_border_compatible BOOLEAN DEFAULT true,
  conflict_of_interest_risk NUMERIC DEFAULT 0,
  match_explanation JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants manage own applications" ON public.opportunity_applications
  FOR ALL USING (auth.uid() = applicant_id);
CREATE POLICY "Opportunity creator views applications" ON public.opportunity_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.execution_opportunities eo WHERE eo.id = opportunity_id AND eo.created_by = auth.uid())
  );

-- Team Formation Suggestions
CREATE TABLE public.team_formation_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.execution_opportunities(id) ON DELETE CASCADE NOT NULL,
  suggested_team JSONB DEFAULT '[]',
  complementarity_score NUMERIC DEFAULT 0,
  diversity_index NUMERIC DEFAULT 0,
  trust_balance NUMERIC DEFAULT 0,
  cross_border_synergy NUMERIC DEFAULT 0,
  risk_diversification NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  reasoning JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_formation_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opportunity creator views suggestions" ON public.team_formation_suggestions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.execution_opportunities eo WHERE eo.id = opportunity_id AND eo.created_by = auth.uid())
  );
