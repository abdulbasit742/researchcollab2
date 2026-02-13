
-- =============================================
-- RCollab Research Productivity Suite Tables
-- =============================================

-- 1. Documents (Word alternative)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}',
  version_number INTEGER NOT NULL DEFAULT 1,
  citation_count INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  ai_assisted BOOLEAN NOT NULL DEFAULT false,
  format_style TEXT NOT NULL DEFAULT 'apa',
  status TEXT NOT NULL DEFAULT 'draft',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_owner ON public.documents(owner_id);
CREATE INDEX idx_documents_project ON public.documents(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_documents_status ON public.documents(status);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = owner_id);

-- Document versions
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doc_versions_doc ON public.document_versions(document_id);
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of own docs" ON public.document_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND owner_id = auth.uid())
  );
CREATE POLICY "Users can create versions of own docs" ON public.document_versions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Document comments
CREATE TABLE public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  position_data JSONB,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on own docs" ON public.document_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND owner_id = auth.uid())
    OR user_id = auth.uid()
  );
CREATE POLICY "Authenticated can create comments" ON public.document_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.document_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Spreadsheets (Excel alternative)
CREATE TABLE public.spreadsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Spreadsheet',
  sheet_data JSONB NOT NULL DEFAULT '{"sheets":[{"name":"Sheet1","data":[]}]}',
  formula_support BOOLEAN NOT NULL DEFAULT true,
  ai_analysis_enabled BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_spreadsheets_owner ON public.spreadsheets(owner_id);
CREATE INDEX idx_spreadsheets_project ON public.spreadsheets(project_id) WHERE project_id IS NOT NULL;

ALTER TABLE public.spreadsheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spreadsheets" ON public.spreadsheets
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own spreadsheets" ON public.spreadsheets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own spreadsheets" ON public.spreadsheets
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own spreadsheets" ON public.spreadsheets
  FOR DELETE USING (auth.uid() = owner_id);

-- 3. Presentations (PowerPoint alternative)
CREATE TABLE public.presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Presentation',
  slides_data JSONB NOT NULL DEFAULT '{"slides":[{"id":"1","elements":[],"notes":""}]}',
  template_type TEXT NOT NULL DEFAULT 'academic',
  ai_design_assist BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_presentations_owner ON public.presentations(owner_id);
CREATE INDEX idx_presentations_project ON public.presentations(project_id) WHERE project_id IS NOT NULL;

ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presentations" ON public.presentations
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own presentations" ON public.presentations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own presentations" ON public.presentations
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own presentations" ON public.presentations
  FOR DELETE USING (auth.uid() = owner_id);

-- 4. Research Templates
CREATE TABLE public.research_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  structure_json JSONB NOT NULL DEFAULT '{}',
  institution_id UUID NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_research_templates_type ON public.research_templates(template_type);
ALTER TABLE public.research_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates" ON public.research_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Authenticated can create templates" ON public.research_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners can update templates" ON public.research_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- 5. Institution Documents Vault
CREATE TABLE public.institution_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'restricted',
  review_status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inst_docs_inst ON public.institution_documents(institution_id);
CREATE INDEX idx_inst_docs_doc ON public.institution_documents(document_id);
ALTER TABLE public.institution_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members can view vault docs" ON public.institution_documents
  FOR SELECT USING (
    public.is_institution_admin(auth.uid(), institution_id)
    OR EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND owner_id = auth.uid())
  );
CREATE POLICY "Document owners can submit to vault" ON public.institution_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND owner_id = auth.uid())
  );
CREATE POLICY "Institution admins can update vault docs" ON public.institution_documents
  FOR UPDATE USING (public.is_institution_admin(auth.uid(), institution_id));

-- Auto-update timestamps trigger for new tables
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_collective_updated_at();
CREATE TRIGGER update_spreadsheets_updated_at BEFORE UPDATE ON public.spreadsheets
  FOR EACH ROW EXECUTE FUNCTION public.update_collective_updated_at();
CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations
  FOR EACH ROW EXECUTE FUNCTION public.update_collective_updated_at();
