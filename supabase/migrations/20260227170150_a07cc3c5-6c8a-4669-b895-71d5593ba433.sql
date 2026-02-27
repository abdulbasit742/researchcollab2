
-- ============================================================
-- FKSE: Federated Knowledge Sovereignty Engine
-- ============================================================

-- Deployment Nodes
CREATE TABLE public.deployment_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL,
  region TEXT NOT NULL,
  owner_type TEXT NOT NULL DEFAULT 'university' CHECK (owner_type IN ('government','university','enterprise','foundation')),
  owner_id UUID,
  compliance_profile JSONB DEFAULT '{}'::jsonb,
  federation_status TEXT NOT NULL DEFAULT 'isolated' CHECK (federation_status IN ('isolated','federated','restricted')),
  trust_interoperability_level TEXT NOT NULL DEFAULT 'basic' CHECK (trust_interoperability_level IN ('none','basic','verified','full')),
  encryption_key_id TEXT,
  api_token_hash TEXT,
  rate_limit_per_hour INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.deployment_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read nodes" ON public.deployment_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert nodes" ON public.deployment_nodes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update nodes" ON public.deployment_nodes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Federation Agreements (bilateral)
CREATE TABLE public.federation_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES public.deployment_nodes(id) NOT NULL,
  target_node_id UUID REFERENCES public.deployment_nodes(id) NOT NULL,
  agreement_type TEXT NOT NULL DEFAULT 'metadata_only' CHECK (agreement_type IN ('metadata_only','partial','full','restricted')),
  data_exchange_scope JSONB DEFAULT '{"claims_metadata":true,"full_documents":false,"funding_details":false,"trust_scores":true}'::jsonb,
  jurisdiction_alignment JSONB DEFAULT '{}'::jsonb,
  trust_reciprocity_level TEXT DEFAULT 'basic',
  dispute_resolution_jurisdiction TEXT,
  compliance_tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','revoked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(source_node_id, target_node_id)
);

ALTER TABLE public.federation_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read agreements" ON public.federation_agreements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert agreements" ON public.federation_agreements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update agreements" ON public.federation_agreements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Federated Claim Registry (metadata-only shared claims)
CREATE TABLE public.federated_claim_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_claim_id TEXT NOT NULL UNIQUE,
  origin_node_id UUID REFERENCES public.deployment_nodes(id) NOT NULL,
  topic_tags TEXT[] DEFAULT '{}',
  claim_type TEXT,
  influence_score NUMERIC DEFAULT 0,
  institution_origin TEXT,
  citation_count INTEGER DEFAULT 0,
  trust_weight NUMERIC DEFAULT 0,
  cross_border_adoption_count INTEGER DEFAULT 0,
  data_residency_tag TEXT NOT NULL,
  is_restricted BOOLEAN DEFAULT false,
  restriction_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.federated_claim_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read claims" ON public.federated_claim_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert claims" ON public.federated_claim_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update claims" ON public.federated_claim_registry FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Federation Audit Logs
CREATE TABLE public.federation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES public.deployment_nodes(id),
  target_node_id UUID REFERENCES public.deployment_nodes(id),
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  was_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.federation_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read logs" ON public.federation_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert logs" ON public.federation_audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trust Proxy Mappings (cross-node trust reconciliation)
CREATE TABLE public.trust_proxy_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  origin_node_id UUID REFERENCES public.deployment_nodes(id) NOT NULL,
  target_node_id UUID REFERENCES public.deployment_nodes(id) NOT NULL,
  origin_ecs NUMERIC DEFAULT 0,
  federated_trust_weight NUMERIC DEFAULT 0,
  institution_verification_level TEXT DEFAULT 'unverified',
  peer_review_credibility NUMERIC DEFAULT 0,
  funding_success_rate NUMERIC DEFAULT 0,
  local_proxy_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, origin_node_id, target_node_id)
);

ALTER TABLE public.trust_proxy_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read proxies" ON public.trust_proxy_mappings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert proxies" ON public.trust_proxy_mappings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update proxies" ON public.trust_proxy_mappings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Federated Collaboration Contracts
CREATE TABLE public.federated_collaboration_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES public.deployment_nodes(id) NOT NULL,
  target_node_id UUID REFERENCES public.deployment_nodes(id) NOT NULL,
  agreement_id UUID REFERENCES public.federation_agreements(id),
  contract_title TEXT NOT NULL,
  data_exchange_scope JSONB DEFAULT '{}'::jsonb,
  funding_flow_restrictions JSONB DEFAULT '{}'::jsonb,
  dispute_resolution_jurisdiction TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','terminated')),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.federated_collaboration_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read contracts" ON public.federated_collaboration_contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage contracts" ON public.federated_collaboration_contracts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update contracts" ON public.federated_collaboration_contracts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime for federation audit
ALTER PUBLICATION supabase_realtime ADD TABLE public.federation_audit_logs;
