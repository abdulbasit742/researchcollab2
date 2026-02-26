
-- External Interfaces
CREATE TABLE public.external_interfaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interface_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('government','central_bank','sovereign_wealth_fund','multilateral','development_bank','research_council','ngo','private_capital','regulatory_body','digital_currency_provider')),
  region_scope TEXT[] NOT NULL DEFAULT '{}',
  access_scope TEXT NOT NULL DEFAULT 'read_only' CHECK (access_scope IN ('read_only','aggregate_only','compliance_reporting','co_investment','coordination','full_authorized')),
  compliance_profile TEXT NOT NULL DEFAULT 'standard',
  trust_tier TEXT NOT NULL DEFAULT 'basic' CHECK (trust_tier IN ('basic','verified','trusted','sovereign')),
  api_key_hash TEXT,
  rate_limit_per_hour INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- External Integration Audit Logs
CREATE TABLE public.external_integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interface_id UUID REFERENCES public.external_interfaces(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  region_scope TEXT,
  data_classification TEXT NOT NULL DEFAULT 'aggregated',
  request_metadata JSONB,
  response_summary TEXT,
  was_blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_external_interfaces_type ON public.external_interfaces(institution_type);
CREATE INDEX idx_external_interfaces_active ON public.external_interfaces(is_active);
CREATE INDEX idx_external_integration_logs_interface ON public.external_integration_logs(interface_id);
CREATE INDEX idx_external_integration_logs_created ON public.external_integration_logs(created_at);

-- RLS
ALTER TABLE public.external_interfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read external_interfaces" ON public.external_interfaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read external_integration_logs" ON public.external_integration_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manage external_interfaces" ON public.external_interfaces FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage external_integration_logs" ON public.external_integration_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
