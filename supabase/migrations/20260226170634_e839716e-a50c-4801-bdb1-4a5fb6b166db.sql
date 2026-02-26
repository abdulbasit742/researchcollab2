
-- Sovereign Nodes
CREATE TABLE public.sovereign_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  region_id UUID REFERENCES public.regions(id),
  sovereign_status BOOLEAN NOT NULL DEFAULT false,
  node_capital_limit NUMERIC NOT NULL DEFAULT 0,
  autonomous_policy_enabled BOOLEAN NOT NULL DEFAULT false,
  node_trust_score NUMERIC NOT NULL DEFAULT 50,
  network_participation_status TEXT NOT NULL DEFAULT 'inactive' CHECK (network_participation_status IN ('active', 'inactive', 'suspended')),
  total_network_capital_contributed NUMERIC NOT NULL DEFAULT 0,
  total_network_capital_received NUMERIC NOT NULL DEFAULT 0,
  network_risk_score NUMERIC NOT NULL DEFAULT 0,
  autonomous_max_capital_per_deal NUMERIC DEFAULT 0,
  autonomous_risk_tolerance TEXT DEFAULT 'medium' CHECK (autonomous_risk_tolerance IN ('low', 'medium', 'high')),
  autonomous_preferred_sectors TEXT[] DEFAULT '{}',
  autonomous_min_trust_threshold NUMERIC DEFAULT 50,
  autonomous_dispute_tolerance NUMERIC DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Cross-Border Agreements
CREATE TABLE public.cross_border_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_a UUID NOT NULL REFERENCES public.sovereign_nodes(id),
  node_b UUID NOT NULL REFERENCES public.sovereign_nodes(id),
  allowed_capital_limit NUMERIC NOT NULL DEFAULT 0,
  allowed_purpose TEXT NOT NULL DEFAULT 'research',
  compliance_requirements JSONB DEFAULT '{}',
  capital_routed NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Network Capital Routing Ledger
CREATE TABLE public.network_capital_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID NOT NULL REFERENCES public.sovereign_nodes(id),
  target_node_id UUID NOT NULL REFERENCES public.sovereign_nodes(id),
  amount NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  cross_border_agreement_id UUID REFERENCES public.cross_border_agreements(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  compliance_cleared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Liquidity Exchange Records
CREATE TABLE public.liquidity_exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lender_node_id UUID NOT NULL REFERENCES public.sovereign_nodes(id),
  borrower_node_id UUID NOT NULL REFERENCES public.sovereign_nodes(id),
  amount NUMERIC NOT NULL,
  return_amount NUMERIC NOT NULL DEFAULT 0,
  return_model TEXT NOT NULL DEFAULT 'interest_free' CHECK (return_model IN ('interest_free', 'fixed_return')),
  fixed_return_rate NUMERIC DEFAULT 0,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('proposed', 'active', 'returned', 'defaulted', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Network Council Members
CREATE TABLE public.network_council_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  node_id UUID REFERENCES public.sovereign_nodes(id),
  voting_weight NUMERIC NOT NULL DEFAULT 1,
  region_id UUID REFERENCES public.regions(id),
  active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Network Audit Logs
CREATE TABLE public.network_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  actor_node_id UUID REFERENCES public.sovereign_nodes(id),
  target_node_id UUID REFERENCES public.sovereign_nodes(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  region_id UUID REFERENCES public.regions(id),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sovereign_nodes_tenant ON public.sovereign_nodes(tenant_id);
CREATE INDEX idx_sovereign_nodes_region ON public.sovereign_nodes(region_id);
CREATE INDEX idx_cross_border_node_a ON public.cross_border_agreements(node_a);
CREATE INDEX idx_cross_border_node_b ON public.cross_border_agreements(node_b);
CREATE INDEX idx_capital_routes_source ON public.network_capital_routes(source_node_id);
CREATE INDEX idx_capital_routes_target ON public.network_capital_routes(target_node_id);
CREATE INDEX idx_liquidity_lender ON public.liquidity_exchanges(lender_node_id);
CREATE INDEX idx_liquidity_borrower ON public.liquidity_exchanges(borrower_node_id);
CREATE INDEX idx_network_audit_action ON public.network_audit_logs(action);

-- RLS
ALTER TABLE public.sovereign_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_capital_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_audit_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated read policies
CREATE POLICY "Auth read sovereign_nodes" ON public.sovereign_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cross_border_agreements" ON public.cross_border_agreements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read network_capital_routes" ON public.network_capital_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read liquidity_exchanges" ON public.liquidity_exchanges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read network_council_members" ON public.network_council_members FOR SELECT TO authenticated USING (true);

-- Service role full access
CREATE POLICY "Service manage sovereign_nodes" ON public.sovereign_nodes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage cross_border_agreements" ON public.cross_border_agreements FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage network_capital_routes" ON public.network_capital_routes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage liquidity_exchanges" ON public.liquidity_exchanges FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage network_council_members" ON public.network_council_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage network_audit_logs" ON public.network_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
