
-- Funding Plans: Research-to-Capital conversion
CREATE TABLE public.funding_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.research_workspaces(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'grant' CHECK (plan_type IN ('grant', 'startup', 'enterprise_rnd', 'policy')),
  total_budget NUMERIC NOT NULL DEFAULT 0,
  duration_months INTEGER NOT NULL DEFAULT 12,
  currency TEXT NOT NULL DEFAULT 'PKR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'funded', 'rejected', 'archived')),
  problem_statement TEXT,
  proposed_solution TEXT,
  risk_score NUMERIC,
  feasibility_index NUMERIC,
  trust_weighted_score NUMERIC,
  source_claim_ids UUID[] DEFAULT '{}',
  ai_generation_metadata JSONB DEFAULT '{}',
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.funding_plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_plan_id UUID REFERENCES public.funding_plans(id) ON DELETE CASCADE NOT NULL,
  milestone_title TEXT NOT NULL,
  milestone_description TEXT,
  linked_research_claim_ids UUID[] DEFAULT '{}',
  budget_amount NUMERIC NOT NULL DEFAULT 0,
  expected_duration_days INTEGER NOT NULL DEFAULT 30,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  deliverable_description TEXT,
  evidence_requirement TEXT,
  performance_metric TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.funding_plan_budget_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_plan_id UUID REFERENCES public.funding_plans(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personnel', 'equipment', 'software', 'research', 'compliance', 'contingency', 'travel', 'other')),
  amount NUMERIC NOT NULL DEFAULT 0,
  justification_text TEXT,
  linked_milestone_id UUID REFERENCES public.funding_plan_milestones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.funding_plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_plan_id UUID REFERENCES public.funding_plans(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}',
  change_summary TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.funding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_plan_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_plan_budget_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_plan_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own funding plans" ON public.funding_plans
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users manage milestones via plan" ON public.funding_plan_milestones
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funding_plans WHERE id = funding_plan_id AND owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.funding_plans WHERE id = funding_plan_id AND owner_id = auth.uid())
  );

CREATE POLICY "Users manage budget via plan" ON public.funding_plan_budget_breakdown
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funding_plans WHERE id = funding_plan_id AND owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.funding_plans WHERE id = funding_plan_id AND owner_id = auth.uid())
  );

CREATE POLICY "Users manage versions via plan" ON public.funding_plan_versions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.funding_plans WHERE id = funding_plan_id AND owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.funding_plans WHERE id = funding_plan_id AND owner_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_funding_plans_workspace ON public.funding_plans(workspace_id);
CREATE INDEX idx_funding_plans_owner ON public.funding_plans(owner_id);
CREATE INDEX idx_funding_plan_milestones_plan ON public.funding_plan_milestones(funding_plan_id);
CREATE INDEX idx_funding_plan_budget_plan ON public.funding_plan_budget_breakdown(funding_plan_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.funding_plans;
