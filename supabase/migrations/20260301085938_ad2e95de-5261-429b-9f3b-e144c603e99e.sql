
-- Add project_id to existing research_workspaces if not exists
ALTER TABLE public.research_workspaces ADD COLUMN IF NOT EXISTS project_id UUID;

-- MODULE 1: Workspace Documents
CREATE TABLE public.workspace_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB DEFAULT '{}',
  version_number INT NOT NULL DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_document_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.workspace_documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version_number INT NOT NULL,
  edited_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 2: Execution Timeline
CREATE TABLE public.execution_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  milestone_progress_percentage NUMERIC(5,2) DEFAULT 0,
  funding_progress_percentage NUMERIC(5,2) DEFAULT 0,
  dispute_status TEXT DEFAULT 'none',
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 4: Smart Execution Assistant
CREATE TABLE public.execution_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  recommendation_text TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  is_dismissed BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 5: Public Professional Profiles
CREATE TABLE public.public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT UNIQUE,
  headline TEXT,
  bio TEXT,
  expertise_tags TEXT[] DEFAULT '{}',
  execution_score NUMERIC(5,2) DEFAULT 0,
  verified_projects_count INT DEFAULT 0,
  published_research_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_workspace_documents_workspace ON public.workspace_documents(workspace_id);
CREATE INDEX idx_workspace_doc_history_doc ON public.workspace_document_history(document_id);
CREATE INDEX idx_execution_snapshots_project ON public.execution_snapshots(project_id);
CREATE INDEX idx_execution_snapshots_date ON public.execution_snapshots(snapshot_date);
CREATE INDEX idx_execution_recommendations_project ON public.execution_recommendations(project_id);
CREATE INDEX idx_public_profiles_user ON public.public_profiles(user_id);
CREATE INDEX idx_public_profiles_username ON public.public_profiles(username);

-- RLS
ALTER TABLE public.workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_document_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Workspace Documents: owner_id based policies
CREATE POLICY "Workspace owner manages docs" ON public.workspace_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.research_workspaces rw WHERE rw.id = workspace_id AND rw.owner_id = auth.uid())
  );

CREATE POLICY "Team reads team docs" ON public.workspace_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.research_workspaces rw WHERE rw.id = workspace_id AND rw.visibility IN ('team', 'institutional'))
  );

-- Document History
CREATE POLICY "View doc history" ON public.workspace_document_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_documents wd
      JOIN public.research_workspaces rw ON rw.id = wd.workspace_id
      WHERE wd.id = document_id AND rw.owner_id = auth.uid()
    )
  );

CREATE POLICY "Insert doc history" ON public.workspace_document_history
  FOR INSERT WITH CHECK (edited_by = auth.uid());

-- Execution Snapshots
CREATE POLICY "Auth read snapshots" ON public.execution_snapshots
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert snapshots" ON public.execution_snapshots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Execution Recommendations
CREATE POLICY "Auth read recommendations" ON public.execution_recommendations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert recommendations" ON public.execution_recommendations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update recommendations" ON public.execution_recommendations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Public Profiles
CREATE POLICY "Public view profiles" ON public.public_profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Owner view own" ON public.public_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owner insert own" ON public.public_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner update own" ON public.public_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.execution_recommendations;
