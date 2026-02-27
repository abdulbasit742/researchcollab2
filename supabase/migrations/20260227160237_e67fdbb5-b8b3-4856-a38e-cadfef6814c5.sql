
-- Research Intelligence Engine: Core Tables

-- 1. RESEARCH WORKSPACES
CREATE TABLE IF NOT EXISTS public.research_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  institution_id UUID NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','institutional','shared')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rw_owner ON public.research_workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_rw_institution ON public.research_workspaces(institution_id) WHERE institution_id IS NOT NULL;

ALTER TABLE public.research_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_crud_workspaces" ON public.research_workspaces
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "shared_workspaces_readable" ON public.research_workspaces
  FOR SELECT TO authenticated
  USING (visibility = 'shared');

-- 2. RESEARCH DOCUMENTS
CREATE TABLE IF NOT EXISTS public.research_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES auth.users(id),
  file_id UUID NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT DEFAULT 0,
  extracted_text TEXT,
  parsed_structure JSONB DEFAULT '{}',
  document_chunks JSONB DEFAULT '[]',
  chunk_count INT DEFAULT 0,
  version_number INT NOT NULL DEFAULT 1,
  is_latest_version BOOLEAN NOT NULL DEFAULT true,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending','processing','completed','failed')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rd_workspace ON public.research_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_rd_uploader ON public.research_documents(uploader_id);

ALTER TABLE public.research_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_owner_docs" ON public.research_documents
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT id FROM research_workspaces WHERE owner_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT id FROM research_workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "shared_workspace_docs_readable" ON public.research_documents
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT id FROM research_workspaces WHERE visibility = 'shared'));

-- 3. RESEARCH QUERIES
CREATE TABLE IF NOT EXISTS public.research_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  query_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rq_workspace ON public.research_queries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_rq_user ON public.research_queries(user_id);

ALTER TABLE public.research_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_queries" ON public.research_queries
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_owner_queries" ON public.research_queries
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT id FROM research_workspaces WHERE owner_id = auth.uid()));

-- 4. RESEARCH RESPONSES
CREATE TABLE IF NOT EXISTS public.research_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES public.research_queries(id) ON DELETE CASCADE,
  ai_response TEXT NOT NULL,
  citation_map JSONB NOT NULL DEFAULT '[]',
  confidence_score NUMERIC(4,3) DEFAULT 0.0,
  model_used TEXT,
  token_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rr_query ON public.research_responses(query_id);

ALTER TABLE public.research_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_responses" ON public.research_responses
  FOR SELECT TO authenticated
  USING (query_id IN (SELECT id FROM research_queries WHERE user_id = auth.uid()));

CREATE POLICY "users_insert_responses" ON public.research_responses
  FOR INSERT TO authenticated
  WITH CHECK (query_id IN (SELECT id FROM research_queries WHERE user_id = auth.uid()));

-- 5. RESEARCH WORKSPACE MEMBERS (for shared/institutional)
CREATE TABLE IF NOT EXISTS public.research_workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer','editor','admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.research_workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_own" ON public.research_workspace_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "workspace_owner_manage_members" ON public.research_workspace_members
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT id FROM research_workspaces WHERE owner_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT id FROM research_workspaces WHERE owner_id = auth.uid()));

-- 6. RESEARCH AUDIT LOG
CREATE TABLE IF NOT EXISTS public.research_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('upload','query','response','export','delete','share','convert')),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_owner_audit" ON public.research_audit_log
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT id FROM research_workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "users_insert_audit" ON public.research_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Immutability
CREATE OR REPLACE FUNCTION public.prevent_research_audit_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Research audit log is append-only'; RETURN NULL; END;
$$;

CREATE TRIGGER enforce_research_audit_no_update
  BEFORE UPDATE ON public.research_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_research_audit_mutation();

CREATE TRIGGER enforce_research_audit_no_delete
  BEFORE DELETE ON public.research_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_research_audit_mutation();

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_queries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_responses;
