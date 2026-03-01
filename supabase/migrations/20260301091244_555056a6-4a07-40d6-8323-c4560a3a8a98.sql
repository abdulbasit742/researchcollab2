
-- ============================================================
-- MODULE 1: Global Search Index
-- ============================================================
CREATE TABLE public.global_search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('project','milestone','task','artifact','message','profile','review')),
  entity_id uuid NOT NULL,
  title text NOT NULL,
  content_excerpt text,
  institution_id uuid,
  visibility_scope text NOT NULL DEFAULT 'public' CHECK (visibility_scope IN ('private','team','institutional','public')),
  searchable_tsv tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_gsi_tsv ON public.global_search_index USING gin(searchable_tsv);
CREATE INDEX idx_gsi_entity_type ON public.global_search_index(entity_type);
CREATE INDEX idx_gsi_visibility ON public.global_search_index(visibility_scope);
CREATE INDEX idx_gsi_institution ON public.global_search_index(institution_id);

-- Trigger to auto-compute tsvector
CREATE OR REPLACE FUNCTION public.gsi_update_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.searchable_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content_excerpt, '')), 'B');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gsi_tsv
  BEFORE INSERT OR UPDATE ON public.global_search_index
  FOR EACH ROW EXECUTE FUNCTION public.gsi_update_tsv();

ALTER TABLE public.global_search_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public search entries"
  ON public.global_search_index FOR SELECT TO authenticated
  USING (visibility_scope = 'public');

CREATE POLICY "Users can read own institution entries"
  ON public.global_search_index FOR SELECT TO authenticated
  USING (
    visibility_scope IN ('institutional', 'team') AND
    institution_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- MODULE 4: Public Research Index
-- ============================================================
CREATE TABLE public.public_research_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_execution_id uuid,
  project_title text NOT NULL,
  institution_name text,
  institution_id uuid,
  validation_status text DEFAULT 'pending',
  execution_score numeric DEFAULT 0,
  searchable_tags text[] DEFAULT '{}',
  searchable_tsv tsvector,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.pri_update_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.searchable_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.project_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.institution_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.searchable_tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pri_tsv
  BEFORE INSERT OR UPDATE ON public.public_research_index
  FOR EACH ROW EXECUTE FUNCTION public.pri_update_tsv();

CREATE INDEX idx_pri_tsv ON public.public_research_index USING gin(searchable_tsv);
CREATE INDEX idx_pri_tags ON public.public_research_index USING gin(searchable_tags);
CREATE INDEX idx_pri_score ON public.public_research_index(execution_score DESC);

ALTER TABLE public.public_research_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public research readable by authenticated"
  ON public.public_research_index FOR SELECT TO authenticated USING (true);

-- ============================================================
-- MODULE 5: Trending Signals
-- ============================================================
CREATE TABLE public.trending_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  entity_title text,
  engagement_score numeric DEFAULT 0,
  activity_velocity numeric DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_trending_score ON public.trending_signals(engagement_score DESC);
CREATE INDEX idx_trending_velocity ON public.trending_signals(activity_velocity DESC);

ALTER TABLE public.trending_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trending signals readable by authenticated"
  ON public.trending_signals FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Search Audit Log
-- ============================================================
CREATE TABLE public.search_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query_text text NOT NULL,
  filters jsonb,
  result_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sal_user ON public.search_audit_log(user_id);
CREATE INDEX idx_sal_created ON public.search_audit_log(created_at DESC);

ALTER TABLE public.search_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own audit logs"
  ON public.search_audit_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own audit logs"
  ON public.search_audit_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- MODULE 2: Search RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_platform(
  query_text text,
  filter_entity_types text[] DEFAULT NULL,
  filter_institution_id uuid DEFAULT NULL,
  filter_date_from timestamptz DEFAULT NULL,
  filter_date_to timestamptz DEFAULT NULL,
  page_num integer DEFAULT 1,
  page_size integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  entity_type text,
  entity_id uuid,
  title text,
  content_excerpt text,
  institution_id uuid,
  visibility_scope text,
  rank real,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ts_query tsquery;
  offset_val integer;
  caller_id uuid;
BEGIN
  caller_id := auth.uid();

  -- Rate limiting
  IF (
    SELECT count(*) FROM public.search_audit_log sal
    WHERE sal.user_id = caller_id AND sal.created_at > now() - interval '1 hour'
  ) > 100 THEN
    RAISE EXCEPTION 'Search rate limit exceeded';
  END IF;

  IF page_size > 50 THEN page_size := 50; END IF;
  IF page_size < 1 THEN page_size := 1; END IF;
  IF page_num < 1 THEN page_num := 1; END IF;
  offset_val := (page_num - 1) * page_size;

  BEGIN
    ts_query := websearch_to_tsquery('english', query_text);
  EXCEPTION WHEN OTHERS THEN
    ts_query := to_tsquery('english', regexp_replace(query_text, '[^a-zA-Z0-9 ]', '', 'g') || ':*');
  END;

  -- Log search
  INSERT INTO public.search_audit_log (user_id, query_text, filters)
  VALUES (caller_id, query_text, jsonb_build_object(
    'entity_types', filter_entity_types,
    'institution_id', filter_institution_id
  ));

  RETURN QUERY
  SELECT
    gsi.id, gsi.entity_type, gsi.entity_id, gsi.title,
    gsi.content_excerpt, gsi.institution_id, gsi.visibility_scope,
    ts_rank(gsi.searchable_tsv, ts_query) AS rank,
    gsi.created_at
  FROM public.global_search_index gsi
  WHERE
    gsi.searchable_tsv @@ ts_query
    AND (
      gsi.visibility_scope = 'public'
      OR (
        gsi.visibility_scope IN ('institutional', 'team')
        AND gsi.institution_id IN (
          SELECT org_id FROM public.organization_members om WHERE om.user_id = caller_id
        )
      )
    )
    AND (filter_entity_types IS NULL OR gsi.entity_type = ANY(filter_entity_types))
    AND (filter_institution_id IS NULL OR gsi.institution_id = filter_institution_id)
    AND (filter_date_from IS NULL OR gsi.created_at >= filter_date_from)
    AND (filter_date_to IS NULL OR gsi.created_at <= filter_date_to)
  ORDER BY rank DESC, gsi.created_at DESC
  LIMIT page_size OFFSET offset_val;
END;
$$;

-- ============================================================
-- MODULE 5: Trending RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_trending_entities(
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  entity_type text,
  entity_id uuid,
  entity_title text,
  engagement_score numeric,
  activity_velocity numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF limit_count > 50 THEN limit_count := 50; END IF;
  RETURN QUERY
  SELECT ts.entity_type, ts.entity_id, ts.entity_title, ts.engagement_score, ts.activity_velocity
  FROM public.trending_signals ts
  WHERE ts.updated_at > now() - interval '7 days'
  ORDER BY ts.engagement_score DESC, ts.activity_velocity DESC
  LIMIT limit_count;
END;
$$;
