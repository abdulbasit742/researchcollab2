
-- Governing Bodies
CREATE TABLE public.governing_bodies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id),
  jurisdiction_scope TEXT,
  oversight_level TEXT NOT NULL DEFAULT 'regional' CHECK (oversight_level IN ('national', 'regional', 'sectoral')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public Grant Pools
CREATE TABLE public.public_grant_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governing_body_id UUID NOT NULL REFERENCES public.governing_bodies(id),
  region_id UUID REFERENCES public.regions(id),
  name TEXT NOT NULL,
  total_committed NUMERIC NOT NULL DEFAULT 0,
  total_allocated NUMERIC NOT NULL DEFAULT 0,
  allocation_policy TEXT DEFAULT 'performance_based',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collaboration Agreements
CREATE TABLE public.collaboration_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_a UUID NOT NULL REFERENCES public.tenants(id),
  tenant_b UUID NOT NULL REFERENCES public.tenants(id),
  agreement_type TEXT NOT NULL DEFAULT 'research' CHECK (agreement_type IN ('research', 'capital', 'exchange')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'completed', 'terminated')),
  terms JSONB,
  approved_by_a BOOLEAN DEFAULT false,
  approved_by_b BOOLEAN DEFAULT false,
  region_id UUID REFERENCES public.regions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Governance Audit Logs
CREATE TABLE public.governance_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  actor_id UUID,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  region_id UUID REFERENCES public.regions(id),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_governing_bodies_region ON public.governing_bodies(region_id);
CREATE INDEX idx_public_grant_pools_body ON public.public_grant_pools(governing_body_id);
CREATE INDEX idx_collab_agreements_a ON public.collaboration_agreements(tenant_a);
CREATE INDEX idx_collab_agreements_b ON public.collaboration_agreements(tenant_b);
CREATE INDEX idx_governance_audit_actor ON public.governance_audit_logs(actor_id);

-- RLS
ALTER TABLE public.governing_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_grant_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Gov bodies: authenticated read
CREATE POLICY "Authenticated read governing_bodies" ON public.governing_bodies FOR SELECT TO authenticated USING (true);

-- Grant pools: gov admins via has_role + region
CREATE POLICY "Authenticated read grant_pools" ON public.public_grant_pools FOR SELECT TO authenticated USING (true);

-- Collaboration agreements: tenant members can see their own
CREATE POLICY "Tenant members view agreements" ON public.collaboration_agreements FOR SELECT TO authenticated
  USING (
    tenant_a IN (SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid() AND is_active = true)
    OR tenant_b IN (SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid() AND is_active = true)
  );

-- Governance audit logs: service role only
CREATE POLICY "Service manage governance_audit_logs" ON public.governance_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage governing_bodies" ON public.governing_bodies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage public_grant_pools" ON public.public_grant_pools FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage collaboration_agreements" ON public.collaboration_agreements FOR ALL TO service_role USING (true) WITH CHECK (true);
