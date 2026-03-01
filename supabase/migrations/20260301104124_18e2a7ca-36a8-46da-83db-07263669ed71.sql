
-- Platform Nodes
CREATE TABLE IF NOT EXISTS public.platform_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_name TEXT NOT NULL,
  region TEXT NOT NULL,
  deployment_type TEXT NOT NULL DEFAULT 'centralized',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_nodes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read nodes" ON public.platform_nodes FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Federation Metadata Registry
CREATE TABLE IF NOT EXISTS public.federation_metadata_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  node_origin UUID REFERENCES public.platform_nodes(id),
  federation_visibility TEXT NOT NULL DEFAULT 'private',
  metadata_hash TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federation_metadata_registry ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read fed metadata" ON public.federation_metadata_registry FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_fed_meta_entity ON public.federation_metadata_registry(entity_type, entity_id);

-- Interoperability Endpoints
CREATE TABLE IF NOT EXISTS public.interoperability_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_name TEXT NOT NULL,
  node_id UUID REFERENCES public.platform_nodes(id),
  endpoint_type TEXT NOT NULL,
  access_scope TEXT NOT NULL DEFAULT 'read-only',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interoperability_endpoints ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read interop endpoints" ON public.interoperability_endpoints FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Federated Identity Links
CREATE TABLE IF NOT EXISTS public.federated_identity_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  local_user_id UUID NOT NULL REFERENCES auth.users(id),
  external_node_id UUID REFERENCES public.platform_nodes(id),
  external_user_reference TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federated_identity_links ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read fed identity" ON public.federated_identity_links FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_fed_identity_user ON public.federated_identity_links(local_user_id);

-- Node Governance Metrics
CREATE TABLE IF NOT EXISTS public.node_governance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES public.platform_nodes(id),
  governance_stability_score NUMERIC(5,2) DEFAULT 0,
  anomaly_density NUMERIC(5,2) DEFAULT 0,
  dispute_ratio NUMERIC(5,2) DEFAULT 0,
  review_integrity_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.node_governance_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read node gov" ON public.node_governance_metrics FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_node_gov_node ON public.node_governance_metrics(node_id, generated_at DESC);

-- Federated Discovery Index
CREATE TABLE IF NOT EXISTS public.federated_discovery_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES public.platform_nodes(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  visibility_level TEXT NOT NULL DEFAULT 'summary',
  summary_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federated_discovery_index ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read fed discovery" ON public.federated_discovery_index FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_fed_discovery_node ON public.federated_discovery_index(node_id, entity_type);

-- Federation Compliance Flags
CREATE TABLE IF NOT EXISTS public.federation_compliance_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES public.platform_nodes(id),
  compliance_score NUMERIC(5,2) DEFAULT 0,
  risk_flag TEXT DEFAULT 'none',
  audit_completeness NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federation_compliance_flags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read fed compliance" ON public.federation_compliance_flags FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_fed_compliance_node ON public.federation_compliance_flags(node_id, generated_at DESC);
