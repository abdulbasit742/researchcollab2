
-- =====================================================
-- PROMPT 9: GLOBAL OPEN SCIENCE & LIVING KNOWLEDGE INFRASTRUCTURE (GOSLKI)
-- =====================================================

-- 1. Living Research Objects
CREATE TABLE IF NOT EXISTS public.living_research_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  abstract TEXT,
  researcher_id UUID,
  institution_id UUID,
  grant_id UUID,
  patent_id UUID,
  current_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  openness_level TEXT NOT NULL DEFAULT 'institutional_only',
  metadata JSONB DEFAULT '{}',
  funding_breakdown JSONB DEFAULT '{}',
  milestone_timeline JSONB DEFAULT '[]',
  dataset_links TEXT[] DEFAULT '{}',
  code_repository_url TEXT,
  industry_application_note TEXT,
  reproducibility_status TEXT DEFAULT 'not_assessed',
  ethical_approval_doc TEXT,
  institutional_validation TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. LRO Version History
CREATE TABLE IF NOT EXISTS public.lro_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lro_id UUID NOT NULL REFERENCES public.living_research_objects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  change_summary TEXT NOT NULL,
  change_type TEXT NOT NULL,
  content_snapshot JSONB DEFAULT '{}',
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Research Datasets (already exists, add missing columns)
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS lro_id UUID;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS data_schema JSONB DEFAULT '{}';
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS metadata_standard TEXT;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'institutional_only';
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS privacy_compliance_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS anonymization_verified BOOLEAN DEFAULT false;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS encryption_verified BOOLEAN DEFAULT false;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS retention_policy TEXT;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS file_count INTEGER DEFAULT 0;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS reuse_count INTEGER DEFAULT 0;
ALTER TABLE public.research_datasets ADD COLUMN IF NOT EXISTS fork_count INTEGER DEFAULT 0;

-- 4. Code Reproducibility Records
CREATE TABLE IF NOT EXISTS public.code_reproducibility_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lro_id UUID REFERENCES public.living_research_objects(id),
  repository_url TEXT,
  environment_spec JSONB DEFAULT '{}',
  dependency_manifest JSONB DEFAULT '{}',
  container_image TEXT,
  model_weights_path TEXT,
  experiment_logs JSONB DEFAULT '[]',
  hyperparameters JSONB DEFAULT '{}',
  benchmark_results JSONB DEFAULT '{}',
  reproducibility_test_passed BOOLEAN DEFAULT false,
  documentation_completeness NUMERIC DEFAULT 0,
  version_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Reproducibility Reliability Index
CREATE TABLE IF NOT EXISTS public.reproducibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lro_id UUID NOT NULL,
  code_availability NUMERIC DEFAULT 0,
  dataset_accessibility NUMERIC DEFAULT 0,
  environment_reproducibility NUMERIC DEFAULT 0,
  third_party_replications INTEGER DEFAULT 0,
  replication_success_rate NUMERIC DEFAULT 0,
  documentation_completeness NUMERIC DEFAULT 0,
  version_transparency NUMERIC DEFAULT 0,
  dependency_clarity NUMERIC DEFAULT 0,
  overall_rri NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Replication Attempts
CREATE TABLE IF NOT EXISTS public.replication_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lro_id UUID NOT NULL,
  replicator_id UUID,
  institution_id UUID,
  status TEXT NOT NULL DEFAULT 'in_progress',
  success BOOLEAN,
  report_summary TEXT,
  inconsistencies JSONB DEFAULT '[]',
  corrections_suggested JSONB DEFAULT '[]',
  extension_proposals JSONB DEFAULT '[]',
  derivative_lro_id UUID,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 7. Dataset Access Audit Log
CREATE TABLE IF NOT EXISTS public.dataset_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL,
  accessed_by UUID,
  access_type TEXT NOT NULL,
  access_granted BOOLEAN NOT NULL DEFAULT true,
  denial_reason TEXT,
  ip_hash TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Open Science Impact Scores
CREATE TABLE IF NOT EXISTS public.open_science_impact_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  dataset_reuse_frequency INTEGER DEFAULT 0,
  code_fork_count INTEGER DEFAULT 0,
  replication_attempts INTEGER DEFAULT 0,
  replication_success_rate NUMERIC DEFAULT 0,
  derivative_citations INTEGER DEFAULT 0,
  cross_domain_reuse INTEGER DEFAULT 0,
  community_validation_depth NUMERIC DEFAULT 0,
  industry_dataset_adoption INTEGER DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.living_research_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lro_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_reproducibility_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproducibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replication_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_science_impact_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth read living_research_objects" ON public.living_research_objects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read lro_versions" ON public.lro_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read code_reproducibility" ON public.code_reproducibility_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read reproducibility_scores" ON public.reproducibility_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read replication_attempts" ON public.replication_attempts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read dataset_access_audit" ON public.dataset_access_audit FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read open_science_impact" ON public.open_science_impact_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth insert living_research_objects" ON public.living_research_objects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert lro_versions" ON public.lro_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert code_reproducibility" ON public.code_reproducibility_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert reproducibility_scores" ON public.reproducibility_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert replication_attempts" ON public.replication_attempts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert dataset_access_audit" ON public.dataset_access_audit FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert open_science_impact" ON public.open_science_impact_scores FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anon read public LROs" ON public.living_research_objects FOR SELECT TO anon USING (openness_level = 'fully_public');
