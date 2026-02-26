
-- Governance Policies
CREATE TABLE public.governance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('capital_limit', 'risk_threshold', 'allocation_rule', 'compliance_rule', 'liquidity_rule')),
  current_value JSONB NOT NULL DEFAULT '{}',
  proposed_value JSONB,
  region_scope UUID REFERENCES public.regions(id),
  tenant_scope UUID REFERENCES public.tenants(id),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('active', 'proposed', 'rejected', 'archived', 'simulated')),
  simulation_report JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Policy Versions
CREATE TABLE public.policy_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.governance_policies(id),
  version_number INT NOT NULL DEFAULT 1,
  previous_value JSONB,
  new_value JSONB NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimizer Recommendations
CREATE TABLE public.optimizer_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_type TEXT NOT NULL,
  target_policy_id UUID REFERENCES public.governance_policies(id),
  current_value JSONB,
  recommended_value JSONB NOT NULL,
  rationale TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0,
  impact_summary JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add proposal_id to existing governance_votes if not present
ALTER TABLE public.governance_votes ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES public.governance_policies(id);
ALTER TABLE public.governance_votes ADD COLUMN IF NOT EXISTS voter_tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.governance_votes ADD COLUMN IF NOT EXISTS voter_node_id UUID REFERENCES public.sovereign_nodes(id);
ALTER TABLE public.governance_votes ADD COLUMN IF NOT EXISTS vote_weight NUMERIC DEFAULT 1;
ALTER TABLE public.governance_votes ADD COLUMN IF NOT EXISTS rationale TEXT;

-- Indexes
CREATE INDEX idx_gov_policies_status ON public.governance_policies(status);
CREATE INDEX idx_gov_policies_type ON public.governance_policies(policy_type);
CREATE INDEX idx_policy_versions_policy ON public.policy_versions(policy_id);
CREATE INDEX IF NOT EXISTS idx_gov_votes_proposal ON public.governance_votes(proposal_id);
CREATE INDEX idx_optimizer_recs_status ON public.optimizer_recommendations(status);

-- RLS
ALTER TABLE public.governance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimizer_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read governance_policies" ON public.governance_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read policy_versions" ON public.policy_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read optimizer_recommendations" ON public.optimizer_recommendations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service manage governance_policies" ON public.governance_policies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage policy_versions" ON public.policy_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage optimizer_recommendations" ON public.optimizer_recommendations FOR ALL TO service_role USING (true) WITH CHECK (true);
