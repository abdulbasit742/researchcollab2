
-- Enhanced Dataset Registry with full structured fields
CREATE TABLE public.dke_dataset_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  domain_category TEXT NOT NULL,
  sub_domain TEXT,
  data_type TEXT DEFAULT 'tabular',
  data_format TEXT DEFAULT 'csv',
  dataset_size_mb NUMERIC(12,2),
  record_count BIGINT,
  feature_count INTEGER,
  institution_id UUID,
  creator_id UUID,
  creator_seid TEXT,
  license_type TEXT DEFAULT 'research_only',
  access_level TEXT DEFAULT 'restricted',
  price_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  tags TEXT[] DEFAULT '{}',
  related_project_ids UUID[] DEFAULT '{}',
  sample_preview JSONB,
  schema_definition JSONB,
  quality_score NUMERIC(5,2),
  completeness_score NUMERIC(5,2),
  freshness_score NUMERIC(5,2),
  download_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewing','published','archived','suspended')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dke_dataset_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage datasets" ON public.dke_dataset_registry FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Knowledge Object Registry
CREATE TABLE public.dke_knowledge_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  object_type TEXT NOT NULL DEFAULT 'report',
  domain TEXT,
  author_id UUID,
  author_seid TEXT,
  institution_id UUID,
  linked_dataset_ids UUID[] DEFAULT '{}',
  linked_project_ids UUID[] DEFAULT '{}',
  content_url TEXT,
  content_hash TEXT,
  license_type TEXT DEFAULT 'open_access',
  access_level TEXT DEFAULT 'public',
  price_amount NUMERIC(12,2) DEFAULT 0,
  version TEXT DEFAULT '1.0',
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  quality_score NUMERIC(5,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewing','published','archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dke_knowledge_objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage knowledge objects" ON public.dke_knowledge_objects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Dataset Licensing Transactions
CREATE TABLE public.dke_license_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL DEFAULT 'dataset',
  asset_id UUID NOT NULL,
  licensee_id UUID NOT NULL,
  licensor_id UUID,
  license_type TEXT NOT NULL,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  platform_fee NUMERIC(12,2) DEFAULT 0,
  fee_rate NUMERIC(5,4) DEFAULT 0.20,
  currency TEXT DEFAULT 'USD',
  access_granted_at TIMESTAMPTZ DEFAULT now(),
  access_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending','active','expired','revoked')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dke_license_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage licenses" ON public.dke_license_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Dataset Quality Reviews
CREATE TABLE public.dke_quality_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT DEFAULT 'dataset',
  asset_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewer_role TEXT DEFAULT 'peer',
  quality_score NUMERIC(5,2),
  completeness_score NUMERIC(5,2),
  accuracy_score NUMERIC(5,2),
  documentation_score NUMERIC(5,2),
  review_notes TEXT,
  recommendation TEXT DEFAULT 'approve' CHECK (recommendation IN ('approve','revise','reject')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','disputed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.dke_quality_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage reviews" ON public.dke_quality_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AI Discovery Recommendations
CREATE TABLE public.dke_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  asset_type TEXT DEFAULT 'dataset',
  asset_id UUID NOT NULL,
  asset_title TEXT,
  match_score NUMERIC(5,2),
  match_reasons JSONB,
  was_clicked BOOLEAN DEFAULT false,
  was_acquired BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dke_ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users see own recommendations" ON public.dke_ai_recommendations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Analytics Events for DKE
CREATE TABLE public.dke_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  asset_type TEXT,
  asset_id UUID,
  user_id UUID,
  institution_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dke_analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users log events" ON public.dke_analytics_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
