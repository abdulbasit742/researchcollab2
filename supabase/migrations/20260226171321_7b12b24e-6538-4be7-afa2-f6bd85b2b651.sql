
-- Infrastructure Nodes
CREATE TABLE public.infrastructure_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES public.regions(id),
  cloud_provider TEXT NOT NULL DEFAULT 'primary',
  failover_priority INT NOT NULL DEFAULT 1,
  health_status TEXT NOT NULL DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'down', 'maintenance')),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Institution Identity Registry
CREATE TABLE public.institution_identity_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) UNIQUE,
  global_identity_hash TEXT NOT NULL UNIQUE,
  trust_signature TEXT,
  region_origin UUID REFERENCES public.regions(id),
  reputation_score NUMERIC NOT NULL DEFAULT 50,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trust Index History
CREATE TABLE public.trust_index_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  trust_type TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Capital Index Snapshots
CREATE TABLE public.capital_index_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES public.regions(id),
  innovation_index NUMERIC NOT NULL DEFAULT 0,
  capital_velocity_index NUMERIC NOT NULL DEFAULT 0,
  completion_index NUMERIC NOT NULL DEFAULT 0,
  risk_adjusted_return_index NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Intergovernmental Agreements
CREATE TABLE public.intergovernmental_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_a UUID NOT NULL REFERENCES public.regions(id),
  region_b UUID NOT NULL REFERENCES public.regions(id),
  capital_limit NUMERIC NOT NULL DEFAULT 0,
  compliance_alignment_score NUMERIC NOT NULL DEFAULT 0,
  risk_sharing_terms JSONB DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_infra_nodes_region ON public.infrastructure_nodes(region_id);
CREATE INDEX idx_infra_nodes_health ON public.infrastructure_nodes(health_status);
CREATE INDEX idx_identity_registry_tenant ON public.institution_identity_registry(tenant_id);
CREATE INDEX idx_trust_history_entity ON public.trust_index_history(entity_id, entity_type);
CREATE INDEX idx_trust_history_created ON public.trust_index_history(created_at);
CREATE INDEX idx_capital_snapshots_region ON public.capital_index_snapshots(region_id);
CREATE INDEX idx_intergov_agreements_regions ON public.intergovernmental_agreements(region_a, region_b);

-- RLS
ALTER TABLE public.infrastructure_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_identity_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_index_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_index_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intergovernmental_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read infrastructure_nodes" ON public.infrastructure_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read institution_identity_registry" ON public.institution_identity_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read trust_index_history" ON public.trust_index_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read capital_index_snapshots" ON public.capital_index_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read intergovernmental_agreements" ON public.intergovernmental_agreements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service manage infrastructure_nodes" ON public.infrastructure_nodes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage institution_identity_registry" ON public.institution_identity_registry FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage trust_index_history" ON public.trust_index_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage capital_index_snapshots" ON public.capital_index_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage intergovernmental_agreements" ON public.intergovernmental_agreements FOR ALL TO service_role USING (true) WITH CHECK (true);
