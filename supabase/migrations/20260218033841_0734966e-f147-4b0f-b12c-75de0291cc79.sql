
-- SIP Protocol Versions
CREATE TABLE public.sip_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  change_summary TEXT NOT NULL,
  compatibility_notes TEXT,
  approved_by UUID,
  activation_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view SIP versions" ON public.sip_versions FOR SELECT USING (true);
CREATE POLICY "Admins can manage SIP versions" ON public.sip_versions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- SIP Innovation Events (canonical event log)
CREATE TABLE public.sip_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'FYP_CREATED','MILESTONE_APPROVED','ESCROW_FUNDED','ESCROW_RELEASED',
    'CONTRACT_SIGNED','DISPUTE_RESOLVED','STUDENT_HIRED','SPINOFF_CREATED',
    'EQUITY_ISSUED','CAPITAL_ALLOCATED'
  )),
  node_id TEXT NOT NULL DEFAULT 'primary',
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  actor_id UUID,
  impact_value NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 0,
  trust_delta INTEGER DEFAULT 0,
  ledger_reference UUID,
  metadata JSONB DEFAULT '{}',
  sip_version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view SIP events" ON public.sip_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create SIP events" ON public.sip_events FOR INSERT TO authenticated WITH CHECK (true);

-- SIP Node Registry (sovereign nodes)
CREATE TABLE public.sip_node_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL UNIQUE,
  node_name TEXT NOT NULL,
  country_code TEXT,
  jurisdiction TEXT,
  operator_name TEXT,
  endpoint_url TEXT,
  api_token_hash TEXT,
  isolation_mode TEXT DEFAULT 'sovereign' CHECK (isolation_mode IN ('sovereign','federated','shared')),
  is_active BOOLEAN DEFAULT true,
  capabilities JSONB DEFAULT '[]',
  trust_framework_version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_node_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active nodes" ON public.sip_node_registry FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage nodes" ON public.sip_node_registry FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- SIP Trust Protocol Snapshots
CREATE TABLE public.sip_trust_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  node_id TEXT NOT NULL DEFAULT 'primary',
  trust_score INTEGER NOT NULL,
  delivery_index NUMERIC DEFAULT 0,
  financial_reliability_index NUMERIC DEFAULT 0,
  collaboration_index NUMERIC DEFAULT 0,
  compliance_index NUMERIC DEFAULT 0,
  consistency_index NUMERIC DEFAULT 0,
  snapshot_version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_trust_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trust snapshots" ON public.sip_trust_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create snapshots" ON public.sip_trust_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed initial SIP version
INSERT INTO public.sip_versions (version, change_summary, compatibility_notes, is_active, activation_date)
VALUES ('1.0.0', 'Initial Sovereign Innovation Protocol release. Defines canonical event types, trust schema, economic ledger standard, capital allocation format, contract integrity rules, and arbitration protocol.', 'First version — no backward compatibility constraints.', true, now());

-- Index for event queries
CREATE INDEX idx_sip_events_type ON public.sip_events (event_type);
CREATE INDEX idx_sip_events_entity ON public.sip_events (entity_type, entity_id);
CREATE INDEX idx_sip_events_node ON public.sip_events (node_id);
CREATE INDEX idx_sip_trust_user ON public.sip_trust_snapshots (user_id);
