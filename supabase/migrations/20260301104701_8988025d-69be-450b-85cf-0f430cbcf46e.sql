
-- National Registry
CREATE TABLE IF NOT EXISTS public.national_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  regulatory_authority_name TEXT NOT NULL,
  compliance_framework TEXT DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.national_registry ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read national registry" ON public.national_registry FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_national_registry_country ON public.national_registry(country_code);

-- Regional Clusters
CREATE TABLE IF NOT EXISTS public.regional_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE CASCADE NOT NULL,
  region_name TEXT NOT NULL,
  region_code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.regional_clusters ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read regional clusters" ON public.regional_clusters FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_regional_clusters_registry ON public.regional_clusters(national_registry_id);

-- National Compliance Metrics
CREATE TABLE IF NOT EXISTS public.national_compliance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE CASCADE NOT NULL,
  audit_completeness_avg NUMERIC(5,2) DEFAULT 0,
  dispute_resolution_speed_avg NUMERIC(5,2) DEFAULT 0,
  review_integrity_score_avg NUMERIC(5,2) DEFAULT 0,
  governance_stability_score_avg NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.national_compliance_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read national compliance" ON public.national_compliance_metrics FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_national_compliance_registry ON public.national_compliance_metrics(national_registry_id, generated_at DESC);

-- National Execution Index
CREATE TABLE IF NOT EXISTS public.national_execution_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE CASCADE NOT NULL,
  execution_velocity_index NUMERIC(5,2) DEFAULT 0,
  milestone_completion_index NUMERIC(5,2) DEFAULT 0,
  engagement_index NUMERIC(5,2) DEFAULT 0,
  predictive_stability_index NUMERIC(5,2) DEFAULT 0,
  overall_health_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.national_execution_index ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read national execution" ON public.national_execution_index FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_national_execution_registry ON public.national_execution_index(national_registry_id, generated_at DESC);

-- National Certification Registry
CREATE TABLE IF NOT EXISTS public.national_certification_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id TEXT NOT NULL UNIQUE,
  issuing_institution_name TEXT NOT NULL,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE SET NULL,
  certificate_type TEXT DEFAULT 'outcome',
  certificate_hash TEXT,
  holder_display_name TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.national_certification_registry ENABLE ROW LEVEL SECURITY;
-- Public read for verification
DO $$ BEGIN CREATE POLICY "Public read national certs" ON public.national_certification_registry FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_national_cert_id ON public.national_certification_registry(certificate_id);

-- National Exports
CREATE TABLE IF NOT EXISTS public.national_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL,
  requested_by UUID NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.national_exports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read national exports" ON public.national_exports FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert national exports" ON public.national_exports FOR INSERT WITH CHECK (auth.uid() = requested_by); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- National Registry Settings (Sovereign Data Isolation)
CREATE TABLE IF NOT EXISTS public.national_registry_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data_residency_policy TEXT DEFAULT 'local_only',
  cross_region_visibility TEXT DEFAULT 'restricted',
  export_controls TEXT DEFAULT 'standard',
  federation_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.national_registry_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read national settings" ON public.national_registry_settings FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
