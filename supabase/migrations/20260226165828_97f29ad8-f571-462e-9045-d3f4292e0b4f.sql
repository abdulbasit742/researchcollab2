
-- Regions table
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  currency_default TEXT NOT NULL DEFAULT 'USD',
  stripe_account_id TEXT,
  stripe_webhook_secret TEXT,
  data_residency_policy TEXT DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add region_id to tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES public.regions(id);

-- Region feature flags
CREATE TABLE public.region_feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID NOT NULL REFERENCES public.regions(id),
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(region_id, feature_key)
);

-- Regional health snapshots
CREATE TABLE public.region_health_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID NOT NULL REFERENCES public.regions(id),
  db_healthy BOOLEAN DEFAULT true,
  stripe_healthy BOOLEAN DEFAULT true,
  escrow_integrity BOOLEAN DEFAULT true,
  wallet_integrity BOOLEAN DEFAULT true,
  pool_health_score NUMERIC DEFAULT 100,
  anomaly_count INTEGER DEFAULT 0,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tenants_region ON public.tenants(region_id);
CREATE INDEX idx_region_feature_flags_region ON public.region_feature_flags(region_id);
CREATE INDEX idx_region_health_snapshots_region ON public.region_health_snapshots(region_id);

-- RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read regions" ON public.regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read region_feature_flags" ON public.region_feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read region_health_snapshots" ON public.region_health_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manage regions" ON public.regions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage region_feature_flags" ON public.region_feature_flags FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage region_health_snapshots" ON public.region_health_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Insert default region
INSERT INTO public.regions (name, code, currency_default, data_residency_policy)
VALUES ('South Asia', 'ap-south', 'PKR', 'sovereign');
