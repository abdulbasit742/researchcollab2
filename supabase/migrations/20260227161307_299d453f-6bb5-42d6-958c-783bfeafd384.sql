
-- ============================================================
-- LONGITUDINAL RESEARCH MEMORY ENGINE SCHEMA
-- ============================================================

-- Workspace version snapshots (append-only)
CREATE TABLE public.workspace_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  summary_snapshot TEXT,
  consensus_snapshot JSONB DEFAULT '{}',
  claim_graph_snapshot JSONB DEFAULT '{}',
  document_count INT DEFAULT 0,
  claim_count INT DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  institutional_certification JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, version_number)
);

CREATE INDEX idx_workspace_versions_ws ON public.workspace_versions(workspace_id);
CREATE INDEX idx_workspace_versions_num ON public.workspace_versions(workspace_id, version_number);

-- Prevent updates/deletes on locked versions
CREATE OR REPLACE FUNCTION public.protect_locked_versions()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION 'Cannot modify a locked workspace version';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_locked_versions
  BEFORE UPDATE OR DELETE ON public.workspace_versions
  FOR EACH ROW EXECUTE FUNCTION public.protect_locked_versions();

-- Topic consensus history (time-series)
CREATE TABLE public.topic_consensus_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  version_number INT NOT NULL,
  consensus_score NUMERIC DEFAULT 0,
  reinforcement_count INT DEFAULT 0,
  contradiction_count INT DEFAULT 0,
  evidence_density NUMERIC DEFAULT 0,
  claim_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_topic_consensus_ws ON public.topic_consensus_history(workspace_id);
CREATE INDEX idx_topic_consensus_topic ON public.topic_consensus_history(workspace_id, topic);

-- Extend research_claims with evolution tracking
ALTER TABLE public.research_claims
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS revision_parent_id UUID REFERENCES public.research_claims(id),
  ADD COLUMN IF NOT EXISTS revision_reason TEXT,
  ADD COLUMN IF NOT EXISTS first_detected_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS version_introduced INT DEFAULT 1;

CREATE INDEX idx_research_claims_status ON public.research_claims(status);
CREATE INDEX idx_research_claims_parent ON public.research_claims(revision_parent_id);

-- Claim mutation audit log (append-only)
CREATE TABLE public.claim_mutation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.research_claims(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  mutation_type TEXT NOT NULL, -- 'created', 'revised', 'deprecated', 'contested', 'evidence_updated'
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  mutated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_claim_mutation_claim ON public.claim_mutation_log(claim_id);
CREATE INDEX idx_claim_mutation_ws ON public.claim_mutation_log(workspace_id);

-- Trigger: auto-log claim mutations
CREATE OR REPLACE FUNCTION public.log_claim_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.claim_mutation_log (claim_id, workspace_id, mutation_type, old_values, new_values)
    VALUES (
      NEW.id,
      NEW.workspace_id,
      CASE
        WHEN OLD.status != NEW.status THEN 'status_change'
        WHEN OLD.evidence_strength != NEW.evidence_strength THEN 'evidence_updated'
        WHEN OLD.claim_text != NEW.claim_text THEN 'revised'
        ELSE 'updated'
      END,
      jsonb_build_object('status', OLD.status, 'claim_text', OLD.claim_text, 'evidence_strength', OLD.evidence_strength, 'confidence_score', OLD.confidence_score),
      jsonb_build_object('status', NEW.status, 'claim_text', NEW.claim_text, 'evidence_strength', NEW.evidence_strength, 'confidence_score', NEW.confidence_score)
    );
  END IF;
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_claim_mutation
  BEFORE UPDATE ON public.research_claims
  FOR EACH ROW EXECUTE FUNCTION public.log_claim_mutation();

-- Knowledge impact tracking
CREATE TABLE public.research_impact_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.research_workspaces(id) ON DELETE CASCADE,
  version_number INT,
  event_type TEXT NOT NULL, -- 'citation', 'project_conversion', 'grant_funding', 'policy_adoption', 'enterprise_adoption', 'institutional_endorsement'
  related_entity_id UUID,
  related_entity_type TEXT,
  trust_delta NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_impact_events_ws ON public.research_impact_events(workspace_id);

-- RLS policies
ALTER TABLE public.workspace_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_consensus_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_mutation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_impact_events ENABLE ROW LEVEL SECURITY;

-- workspace_versions RLS
CREATE POLICY "Workspace members can view versions" ON public.workspace_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace editors can insert versions" ON public.workspace_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid() AND rwm.role IN ('editor','admin'))
      )
    )
  );

-- topic_consensus_history RLS
CREATE POLICY "Workspace members can view consensus" ON public.topic_consensus_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace editors can insert consensus" ON public.topic_consensus_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid() AND rwm.role IN ('editor','admin'))
      )
    )
  );

-- claim_mutation_log RLS (read-only for workspace members)
CREATE POLICY "Workspace members can view mutations" ON public.claim_mutation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid())
      )
    )
  );

-- Allow system inserts for mutation log
CREATE POLICY "System can insert mutations" ON public.claim_mutation_log
  FOR INSERT WITH CHECK (true);

-- research_impact_events RLS
CREATE POLICY "Workspace members can view impact" ON public.research_impact_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace editors can insert impact" ON public.research_impact_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_workspaces rw
      WHERE rw.id = workspace_id AND (
        rw.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.research_workspace_members rwm WHERE rwm.workspace_id = rw.id AND rwm.user_id = auth.uid() AND rwm.role IN ('editor','admin'))
      )
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_impact_events;
