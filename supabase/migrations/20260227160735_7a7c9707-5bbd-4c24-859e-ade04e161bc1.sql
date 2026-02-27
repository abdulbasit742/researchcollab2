
-- ============================================================
-- RESEARCH CLAIMS & CROSS-DOCUMENT SYNTHESIS SCHEMA
-- ============================================================

-- Claims extracted from document chunks
CREATE TABLE public.research_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.research_documents(id) ON DELETE CASCADE,
  chunk_id TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'fact' CHECK (claim_type IN ('fact', 'hypothesis', 'conclusion', 'statistic', 'method', 'policy')),
  confidence_score NUMERIC DEFAULT 0.5,
  evidence_strength NUMERIC DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for claims
CREATE INDEX idx_research_claims_workspace ON public.research_claims(workspace_id);
CREATE INDEX idx_research_claims_document ON public.research_claims(document_id);
CREATE INDEX idx_research_claims_type ON public.research_claims(claim_type);

-- Relationships between claims across documents
CREATE TABLE public.claim_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  claim_id_a UUID NOT NULL REFERENCES public.research_claims(id) ON DELETE CASCADE,
  claim_id_b UUID NOT NULL REFERENCES public.research_claims(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('reinforces', 'contradicts', 'related', 'extends')),
  similarity_score NUMERIC DEFAULT 0.0,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_claim_relationships_workspace ON public.claim_relationships(workspace_id);
CREATE INDEX idx_claim_relationships_a ON public.claim_relationships(claim_id_a);
CREATE INDEX idx_claim_relationships_b ON public.claim_relationships(claim_id_b);

-- Synthesis reports
CREATE TABLE public.research_synthesis_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  generated_by UUID NOT NULL,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'synthesis' CHECK (report_type IN ('synthesis', 'policy_brief', 'grant_foundation', 'gap_analysis')),
  content JSONB NOT NULL DEFAULT '{}',
  claim_ids UUID[] DEFAULT '{}',
  version_number INT NOT NULL DEFAULT 1,
  is_locked BOOLEAN DEFAULT false,
  institutional_endorsement BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_synthesis_reports_workspace ON public.research_synthesis_reports(workspace_id);

-- RLS
ALTER TABLE public.research_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_synthesis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view claims" ON public.research_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace members can insert claims" ON public.research_claims
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid() AND rwm.role IN ('editor','admin'))
      )
    )
  );

CREATE POLICY "Workspace members can view relationships" ON public.claim_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace members can insert relationships" ON public.claim_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid() AND rwm.role IN ('editor','admin'))
      )
    )
  );

CREATE POLICY "Workspace members can view synthesis" ON public.research_synthesis_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace members can insert synthesis" ON public.research_synthesis_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid() AND rwm.role IN ('editor','admin'))
      )
    )
  );

-- Enable realtime for claim relationships (live graph updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_claims;
ALTER PUBLICATION supabase_realtime ADD TABLE public.claim_relationships;
