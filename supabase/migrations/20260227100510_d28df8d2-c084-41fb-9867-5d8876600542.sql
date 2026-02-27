
-- =====================================================
-- PROMPT 14: GLOBAL RESEARCH INFRASTRUCTURE & INTEROPERABILITY ENGINE (GRIIE)
-- =====================================================

-- 1. API Registry (Open API Architecture)
CREATE TABLE IF NOT EXISTS public.api_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL,
  api_version TEXT NOT NULL DEFAULT 'v1',
  api_type TEXT NOT NULL,
  description TEXT,
  base_path TEXT NOT NULL,
  auth_method TEXT NOT NULL DEFAULT 'bearer',
  rate_limit_per_minute INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  supports_webhooks BOOLEAN DEFAULT false,
  supports_events BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. API Access Grants
CREATE TABLE IF NOT EXISTS public.api_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID REFERENCES public.api_registry(id),
  grantee_type TEXT NOT NULL,
  grantee_id TEXT NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'read',
  scopes TEXT[] DEFAULT '{}',
  api_key_hash TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  granted_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. API Audit Logs
CREATE TABLE IF NOT EXISTS public.api_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID REFERENCES public.api_registry(id),
  caller_type TEXT NOT NULL,
  caller_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  request_metadata JSONB DEFAULT '{}',
  response_summary JSONB DEFAULT '{}',
  ip_address TEXT,
  jurisdiction TEXT,
  called_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. External Integration Configs
CREATE TABLE IF NOT EXISTS public.external_integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  auth_config JSONB DEFAULT '{}',
  sync_frequency TEXT DEFAULT 'daily',
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending',
  error_log JSONB DEFAULT '{}',
  institution_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sandbox_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Webhook Subscriptions
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_type TEXT NOT NULL,
  subscriber_id TEXT NOT NULL,
  event_types TEXT[] NOT NULL DEFAULT '{}',
  callback_url TEXT NOT NULL,
  secret_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Event Bus Log
CREATE TABLE IF NOT EXISTS public.event_bus_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  payload JSONB DEFAULT '{}',
  subscribers_notified INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending',
  emitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Data Export Logs
CREATE TABLE IF NOT EXISTS public.data_export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exporter_type TEXT NOT NULL,
  exporter_id TEXT NOT NULL,
  export_format TEXT NOT NULL,
  export_scope TEXT NOT NULL,
  record_count INTEGER DEFAULT 0,
  destination TEXT,
  jurisdiction TEXT,
  is_aggregated BOOLEAN DEFAULT false,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Cross-Border Data Transfer Requests
CREATE TABLE IF NOT EXISTS public.cross_border_data_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_jurisdiction TEXT NOT NULL,
  destination_jurisdiction TEXT NOT NULL,
  data_category TEXT NOT NULL,
  data_classification TEXT NOT NULL DEFAULT 'standard',
  requester_type TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  encryption_verified BOOLEAN DEFAULT false,
  compliance_flags JSONB DEFAULT '{}',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Extension Marketplace Registry
CREATE TABLE IF NOT EXISTS public.extension_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extension_name TEXT NOT NULL,
  extension_type TEXT NOT NULL,
  developer_id TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  security_review_status TEXT DEFAULT 'pending',
  integrity_audit_status TEXT DEFAULT 'pending',
  permission_scopes TEXT[] DEFAULT '{}',
  install_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Data Standardization Mappings
CREATE TABLE IF NOT EXISTS public.data_standardization_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_type TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  transformation_rule TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Identity Federation Links
CREATE TABLE IF NOT EXISTS public.identity_federation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  display_name TEXT,
  institution_id TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bus_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_data_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extension_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_standardization_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_federation_links ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read
CREATE POLICY "Auth read api_registry" ON public.api_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read api_access_grants" ON public.api_access_grants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read api_audit_logs" ON public.api_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read integration_configs" ON public.external_integration_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read webhook_subs" ON public.webhook_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read event_bus" ON public.event_bus_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read export_logs" ON public.data_export_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cross_border" ON public.cross_border_data_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read extensions" ON public.extension_marketplace FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read std_mappings" ON public.data_standardization_mappings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read identity_fed" ON public.identity_federation_links FOR SELECT TO authenticated USING (true);

-- RLS: Auth insert
CREATE POLICY "Auth insert api_registry" ON public.api_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert api_access_grants" ON public.api_access_grants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert api_audit_logs" ON public.api_audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert integration_configs" ON public.external_integration_configs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert webhook_subs" ON public.webhook_subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert event_bus" ON public.event_bus_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert export_logs" ON public.data_export_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cross_border" ON public.cross_border_data_transfers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert extensions" ON public.extension_marketplace FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert std_mappings" ON public.data_standardization_mappings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert identity_fed" ON public.identity_federation_links FOR INSERT TO authenticated WITH CHECK (true);

-- Auth update for configs and transfers
CREATE POLICY "Auth update integration_configs" ON public.external_integration_configs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth update cross_border" ON public.cross_border_data_transfers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth update webhook_subs" ON public.webhook_subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth update extensions" ON public.extension_marketplace FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Anon read for public marketplace
CREATE POLICY "Anon read extensions" ON public.extension_marketplace FOR SELECT TO anon USING (is_active = true AND is_verified = true);
