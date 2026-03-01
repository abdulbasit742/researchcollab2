
-- Global Federation Registry
CREATE TABLE IF NOT EXISTS public.global_federation_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  federation_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.global_federation_registry ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read global federation" ON public.global_federation_registry FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Federation Members
CREATE TABLE IF NOT EXISTS public.federation_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  federation_id UUID REFERENCES public.global_federation_registry(id) ON DELETE CASCADE NOT NULL,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE CASCADE NOT NULL,
  membership_status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(federation_id, national_registry_id)
);
ALTER TABLE public.federation_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read federation members" ON public.federation_members FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_fed_members_fed ON public.federation_members(federation_id);
CREATE INDEX IF NOT EXISTS idx_fed_members_reg ON public.federation_members(national_registry_id);

-- Cross-National Metadata Index
CREATE TABLE IF NOT EXISTS public.cross_national_metadata_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  federation_id UUID REFERENCES public.global_federation_registry(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL,
  origin_node TEXT NOT NULL,
  entity_hash TEXT NOT NULL,
  visibility_scope TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_national_metadata_index ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read cross national metadata" ON public.cross_national_metadata_index FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_cross_nat_meta_fed ON public.cross_national_metadata_index(federation_id);

-- Global Execution Index
CREATE TABLE IF NOT EXISTS public.global_execution_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  federation_id UUID REFERENCES public.global_federation_registry(id) ON DELETE CASCADE NOT NULL,
  aggregate_completion_rate NUMERIC(5,2) DEFAULT 0,
  aggregate_governance_score NUMERIC(5,2) DEFAULT 0,
  aggregate_compliance_score NUMERIC(5,2) DEFAULT 0,
  aggregate_engagement_score NUMERIC(5,2) DEFAULT 0,
  overall_global_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.global_execution_index ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read global execution" ON public.global_execution_index FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_global_exec_fed ON public.global_execution_index(federation_id, generated_at DESC);

-- Cross-Border Collaborations
CREATE TABLE IF NOT EXISTS public.cross_border_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  originating_country TEXT NOT NULL,
  collaborating_country TEXT NOT NULL,
  collaboration_type TEXT DEFAULT 'research',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_border_collaborations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read cross border" ON public.cross_border_collaborations FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Federation Compliance Index
CREATE TABLE IF NOT EXISTS public.federation_compliance_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  federation_id UUID REFERENCES public.global_federation_registry(id) ON DELETE CASCADE NOT NULL,
  cross_border_transparency_score NUMERIC(5,2) DEFAULT 0,
  audit_integrity_score NUMERIC(5,2) DEFAULT 0,
  certification_verifiability_score NUMERIC(5,2) DEFAULT 0,
  governance_alignment_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federation_compliance_index ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read fed compliance" ON public.federation_compliance_index FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_fed_compliance_fed ON public.federation_compliance_index(federation_id, generated_at DESC);

-- Federation Interoperability Status
CREATE TABLE IF NOT EXISTS public.federation_interoperability_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  national_registry_id UUID REFERENCES public.national_registry(id) ON DELETE CASCADE NOT NULL,
  federation_id UUID REFERENCES public.global_federation_registry(id) ON DELETE CASCADE NOT NULL,
  metadata_exchange_status TEXT DEFAULT 'inactive',
  verification_sync_status TEXT DEFAULT 'inactive',
  compliance_sync_status TEXT DEFAULT 'inactive',
  last_sync_at TIMESTAMPTZ,
  UNIQUE(national_registry_id, federation_id)
);
ALTER TABLE public.federation_interoperability_status ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read fed interop" ON public.federation_interoperability_status FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
