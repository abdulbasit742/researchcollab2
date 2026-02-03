-- ============================================
-- PHASE 13: FIX SIGNUP BUG + INTERDISCIPLINARY + KNOWLEDGE GRAPH + ETHICS
-- ============================================

-- ===========================================
-- PART 1: FIX SIGNUP BUG
-- ===========================================
CREATE OR REPLACE FUNCTION public.update_profile_search_index()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bio TEXT;
BEGIN
  SELECT summary_bio INTO v_bio FROM profile_headers WHERE user_id = NEW.id LIMIT 1;
  
  INSERT INTO search_index (entity_type, entity_id, title, description, university, trust_score_snapshot, searchable_text)
  VALUES (
    'user',
    NEW.id,
    COALESCE(NEW.full_name, COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')),
    v_bio,
    NEW.university,
    0,
    to_tsvector('english', COALESCE(NEW.full_name, '') || ' ' || COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '') || ' ' || COALESCE(v_bio, '') || ' ' || COALESCE(NEW.university, ''))
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    university = EXCLUDED.university,
    searchable_text = EXCLUDED.searchable_text,
    updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- ===========================================
-- PART 2: INTERDISCIPLINARY COLLABORATION SYSTEM
-- ===========================================

CREATE TABLE IF NOT EXISTS public.academic_disciplines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent_discipline_id UUID REFERENCES public.academic_disciplines(id),
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.academic_disciplines (name, description) VALUES
  ('Computer Science', 'Study of computation, algorithms, and information processing'),
  ('Mathematics', 'Pure and applied mathematical sciences'),
  ('Physics', 'Study of matter, energy, and fundamental forces'),
  ('Chemistry', 'Study of substances, their properties, and reactions'),
  ('Biology', 'Study of living organisms and life processes'),
  ('Medicine', 'Health sciences and clinical practice'),
  ('Engineering', 'Application of science to design and build'),
  ('Economics', 'Study of production, distribution, and consumption'),
  ('Psychology', 'Study of mind and behavior'),
  ('Sociology', 'Study of society and social behavior'),
  ('Philosophy', 'Study of fundamental questions of existence and knowledge'),
  ('History', 'Study of past events and human affairs'),
  ('Literature', 'Study of written works and language arts'),
  ('Political Science', 'Study of governance and political systems'),
  ('Environmental Science', 'Study of environment and ecological systems'),
  ('Anthropology', 'Study of humans, societies, and cultures'),
  ('Linguistics', 'Study of language structure and use'),
  ('Education', 'Study of teaching and learning processes'),
  ('Law', 'Study of legal systems and jurisprudence'),
  ('Business', 'Study of commerce and management')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.discipline_affiliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  discipline_id UUID NOT NULL REFERENCES public.academic_disciplines(id) ON DELETE CASCADE,
  depth_level TEXT NOT NULL CHECK (depth_level IN ('primary', 'secondary', 'working_knowledge')),
  verified BOOLEAN DEFAULT false,
  years_experience INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scholar_passport_id, discipline_id)
);

CREATE TABLE IF NOT EXISTS public.interdisciplinary_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  primary_discipline_id UUID NOT NULL REFERENCES public.academic_disciplines(id),
  missing_disciplines UUID[] NOT NULL,
  problem_statement TEXT NOT NULL,
  collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('research', 'methodology', 'application', 'translation')),
  expected_duration TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'institution', 'invited')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'in_progress', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interdisciplinary_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.interdisciplinary_calls(id) ON DELETE CASCADE,
  responder_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offering_disciplines UUID[] NOT NULL,
  proposal_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(call_id, responder_user_id)
);

CREATE TABLE IF NOT EXISTS public.field_translation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_discipline_id UUID NOT NULL REFERENCES public.academic_disciplines(id),
  target_discipline_id UUID NOT NULL REFERENCES public.academic_disciplines(id),
  related_research_timeline_id UUID REFERENCES public.research_timelines(id) ON DELETE SET NULL,
  translation_summary TEXT NOT NULL,
  key_concepts_mapped JSONB,
  methodology_adaptations TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('private', 'collaborators', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bridge_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_timeline_id UUID NOT NULL REFERENCES public.research_timelines(id) ON DELETE CASCADE,
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('translator', 'integrator', 'method_adapter', 'domain_explainer', 'cross_validator')),
  description TEXT,
  source_discipline_id UUID REFERENCES public.academic_disciplines(id),
  target_discipline_id UUID REFERENCES public.academic_disciplines(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(research_timeline_id, scholar_passport_id, role_type)
);

CREATE TABLE IF NOT EXISTS public.interdisciplinary_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  program_name TEXT NOT NULL,
  description TEXT,
  disciplines_involved UUID[] NOT NULL,
  program_lead_user_id UUID REFERENCES public.profiles(id),
  funding_source TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================
-- PART 3: KNOWLEDGE GRAPH
-- ===========================================

CREATE TABLE IF NOT EXISTS public.knowledge_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_type TEXT NOT NULL CHECK (node_type IN ('concept', 'hypothesis', 'method', 'dataset', 'result', 'limitation', 'open_question', 'theory', 'finding')),
  title TEXT NOT NULL,
  description TEXT,
  created_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
  discipline_id UUID REFERENCES public.academic_disciplines(id),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'collaborators', 'public')),
  confidence_level TEXT DEFAULT 'proposed' CHECK (confidence_level IN ('speculative', 'proposed', 'supported', 'established', 'contested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('supports', 'contradicts', 'extends', 'uses', 'derives_from', 'questions', 'refines', 'applies', 'requires')),
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  evidence_summary TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_node_id, target_node_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_node_id UUID NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('publication', 'dataset', 'research_timeline', 'peer_review', 'external_citation', 'experiment')),
  source_id UUID,
  external_url TEXT,
  citation_text TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_lineages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  root_node_id UUID NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  descendant_node_id UUID NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  lineage_type TEXT NOT NULL CHECK (lineage_type IN ('refinement', 'divergence', 'refutation', 'application', 'synthesis', 'specialization')),
  transformation_notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(root_node_id, descendant_node_id)
);

CREATE TABLE IF NOT EXISTS public.knowledge_graph_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('user', 'institution', 'domain', 'global')),
  scope_id UUID,
  discipline_id UUID REFERENCES public.academic_disciplines(id),
  node_count INTEGER DEFAULT 0,
  edge_count INTEGER DEFAULT 0,
  major_clusters JSONB,
  key_concepts TEXT[],
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_node_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_node_id UUID NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(knowledge_node_id, tag)
);

CREATE TABLE IF NOT EXISTS public.knowledge_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_node_id UUID NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES public.profiles(id),
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('created', 'edited', 'validated', 'challenged', 'expanded')),
  contribution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================
-- PART 4: ETHICS PROTOCOLS (use new table name to avoid conflict)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.research_ethics_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_timeline_id UUID REFERENCES public.research_timelines(id) ON DELETE CASCADE,
  ethics_scope TEXT NOT NULL CHECK (ethics_scope IN ('human_subjects', 'animal_research', 'sensitive_data', 'ai_use', 'dual_use', 'environmental', 'none')),
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('minimal', 'low', 'medium', 'high', 'critical')),
  summary TEXT NOT NULL,
  data_handling_plan TEXT,
  participant_protection_measures TEXT,
  requires_review BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'conditional', 'rejected', 'expired', 'revoked')),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.research_ethics_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.research_ethics_protocols(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('ethics_board', 'institution_rep', 'external_reviewer', 'admin')),
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'conditional', 'revise_resubmit', 'reject')),
  conditions TEXT,
  feedback TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.research_consent_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.research_ethics_protocols(id) ON DELETE CASCADE,
  participant_identifier TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('informed', 'anonymized', 'secondary_use', 'withdrawal', 'minor_guardian')),
  consent_text_version TEXT NOT NULL,
  obtained_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  scope_limitations JSONB,
  consent_method TEXT CHECK (consent_method IN ('written', 'electronic', 'verbal_recorded', 'implied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.research_data_sensitivity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('dataset', 'research_timeline', 'knowledge_node')),
  target_id UUID NOT NULL,
  sensitivity_type TEXT NOT NULL CHECK (sensitivity_type IN ('pii', 'biometric', 'medical', 'political', 'minors', 'location', 'genetic', 'financial', 'cultural')),
  handling_requirements TEXT,
  access_restrictions TEXT,
  flagged_by UUID REFERENCES public.profiles(id),
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(target_type, target_id, sensitivity_type)
);

CREATE TABLE IF NOT EXISTS public.research_ethics_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID REFERENCES public.research_ethics_protocols(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('submitted', 'reviewed', 'approved', 'rejected', 'revoked', 'accessed', 'exported', 'consent_obtained', 'consent_withdrawn', 'data_accessed', 'breach_reported')),
  action_details JSONB,
  performed_by UUID REFERENCES public.profiles(id),
  ip_address TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ethics_board_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.organizations(id),
  expertise_areas TEXT[],
  board_role TEXT DEFAULT 'member' CHECK (board_role IN ('chair', 'member', 'advisor', 'external')),
  is_active BOOLEAN DEFAULT true,
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_expires_at TIMESTAMPTZ,
  UNIQUE(user_id, institution_id)
);

CREATE TABLE IF NOT EXISTS public.ethics_protocol_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  ethics_scope TEXT NOT NULL,
  template_content JSONB NOT NULL,
  institution_id UUID REFERENCES public.organizations(id),
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.research_compliance_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_timeline_id UUID NOT NULL REFERENCES public.research_timelines(id) ON DELETE CASCADE UNIQUE,
  ethics_approved BOOLEAN DEFAULT false,
  protocol_id UUID REFERENCES public.research_ethics_protocols(id),
  consent_coverage_percent NUMERIC(5,2) DEFAULT 0,
  data_sensitivity_level TEXT DEFAULT 'none' CHECK (data_sensitivity_level IN ('none', 'low', 'medium', 'high', 'critical')),
  last_compliance_check TIMESTAMPTZ,
  compliance_issues JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================
-- ENABLE RLS
-- ===========================================
ALTER TABLE public.academic_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interdisciplinary_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interdisciplinary_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_translation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interdisciplinary_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_lineages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graph_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_node_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_ethics_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_ethics_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_data_sensitivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_ethics_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethics_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethics_protocol_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_compliance_tracker ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES
-- ===========================================
CREATE POLICY "disciplines_select" ON public.academic_disciplines FOR SELECT USING (true);
CREATE POLICY "disciplines_admin" ON public.academic_disciplines FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "affiliations_select" ON public.discipline_affiliations FOR SELECT USING (true);
CREATE POLICY "affiliations_manage" ON public.discipline_affiliations FOR ALL
  USING (scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()));

CREATE POLICY "calls_select" ON public.interdisciplinary_calls FOR SELECT
  USING (visibility = 'public' OR created_by_user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "calls_manage" ON public.interdisciplinary_calls FOR ALL USING (created_by_user_id = auth.uid());

CREATE POLICY "responses_select" ON public.interdisciplinary_responses FOR SELECT
  USING (responder_user_id = auth.uid() OR call_id IN (SELECT id FROM public.interdisciplinary_calls WHERE created_by_user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "responses_manage" ON public.interdisciplinary_responses FOR ALL USING (responder_user_id = auth.uid());

CREATE POLICY "translations_select" ON public.field_translation_records FOR SELECT
  USING (visibility = 'public' OR created_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "translations_manage" ON public.field_translation_records FOR ALL USING (created_by = auth.uid());

CREATE POLICY "bridge_select" ON public.bridge_roles FOR SELECT USING (true);
CREATE POLICY "bridge_manage" ON public.bridge_roles FOR ALL
  USING (research_timeline_id IN (SELECT id FROM public.research_timelines WHERE owner_user_id = auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "programs_select" ON public.interdisciplinary_programs FOR SELECT USING (true);
CREATE POLICY "programs_manage" ON public.interdisciplinary_programs FOR ALL
  USING (program_lead_user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "nodes_select" ON public.knowledge_nodes FOR SELECT
  USING (visibility = 'public' OR created_by_user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "nodes_manage" ON public.knowledge_nodes FOR ALL USING (created_by_user_id = auth.uid());

CREATE POLICY "edges_select" ON public.knowledge_edges FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE id = source_node_id AND (visibility = 'public' OR created_by_user_id = auth.uid())));
CREATE POLICY "edges_insert" ON public.knowledge_edges FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "sources_select" ON public.knowledge_sources FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE id = knowledge_node_id AND (visibility = 'public' OR created_by_user_id = auth.uid())));
CREATE POLICY "sources_insert" ON public.knowledge_sources FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE id = knowledge_node_id AND created_by_user_id = auth.uid()));

CREATE POLICY "lineages_select" ON public.knowledge_lineages FOR SELECT USING (true);
CREATE POLICY "lineages_insert" ON public.knowledge_lineages FOR INSERT WITH CHECK (recorded_by = auth.uid());

CREATE POLICY "snapshots_select" ON public.knowledge_graph_snapshots FOR SELECT
  USING (scope_type IN ('domain', 'global') OR public.is_admin(auth.uid()));

CREATE POLICY "tags_select" ON public.knowledge_node_tags FOR SELECT USING (true);
CREATE POLICY "tags_manage" ON public.knowledge_node_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE id = knowledge_node_id AND created_by_user_id = auth.uid()));

CREATE POLICY "contributions_select" ON public.knowledge_contributions FOR SELECT USING (true);
CREATE POLICY "contributions_insert" ON public.knowledge_contributions FOR INSERT WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "protocols_select" ON public.research_ethics_protocols FOR SELECT
  USING (created_by = auth.uid() OR research_timeline_id IN (SELECT id FROM public.research_timelines WHERE owner_user_id = auth.uid()) OR auth.uid() IN (SELECT user_id FROM public.ethics_board_members WHERE is_active = true) OR public.is_admin(auth.uid()));
CREATE POLICY "protocols_manage" ON public.research_ethics_protocols FOR ALL USING (created_by = auth.uid());

CREATE POLICY "decisions_select" ON public.research_ethics_decisions FOR SELECT
  USING (reviewer_id = auth.uid() OR protocol_id IN (SELECT id FROM public.research_ethics_protocols WHERE created_by = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "decisions_insert" ON public.research_ethics_decisions FOR INSERT
  WITH CHECK (reviewer_id = auth.uid() AND EXISTS (SELECT 1 FROM public.ethics_board_members WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "consent_select" ON public.research_consent_records FOR SELECT
  USING (protocol_id IN (SELECT id FROM public.research_ethics_protocols WHERE created_by = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "consent_manage" ON public.research_consent_records FOR ALL
  USING (protocol_id IN (SELECT id FROM public.research_ethics_protocols WHERE created_by = auth.uid()));

CREATE POLICY "sensitivity_select" ON public.research_data_sensitivity FOR SELECT
  USING (flagged_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "sensitivity_insert" ON public.research_data_sensitivity FOR INSERT WITH CHECK (flagged_by = auth.uid());

CREATE POLICY "audit_select" ON public.research_ethics_audit FOR SELECT
  USING (performed_by = auth.uid() OR protocol_id IN (SELECT id FROM public.research_ethics_protocols WHERE created_by = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "audit_insert" ON public.research_ethics_audit FOR INSERT WITH CHECK (true);

CREATE POLICY "board_select" ON public.ethics_board_members FOR SELECT USING (true);
CREATE POLICY "board_manage" ON public.ethics_board_members FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "templates_select" ON public.ethics_protocol_templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "templates_manage" ON public.ethics_protocol_templates FOR ALL USING (created_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "compliance_select" ON public.research_compliance_tracker FOR SELECT
  USING (research_timeline_id IN (SELECT id FROM public.research_timelines WHERE owner_user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "compliance_manage" ON public.research_compliance_tracker FOR ALL USING (public.is_admin(auth.uid()));

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_discipline_affiliations_passport ON public.discipline_affiliations(scholar_passport_id);
CREATE INDEX IF NOT EXISTS idx_discipline_affiliations_discipline ON public.discipline_affiliations(discipline_id);
CREATE INDEX IF NOT EXISTS idx_interdisciplinary_calls_status ON public.interdisciplinary_calls(status);
CREATE INDEX IF NOT EXISTS idx_bridge_roles_timeline ON public.bridge_roles(research_timeline_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_creator ON public.knowledge_nodes(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_type ON public.knowledge_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_edges_source ON public.knowledge_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_edges_target ON public.knowledge_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_lineages_root ON public.knowledge_lineages(root_node_id);
CREATE INDEX IF NOT EXISTS idx_ethics_protocols_timeline ON public.research_ethics_protocols(research_timeline_id);
CREATE INDEX IF NOT EXISTS idx_ethics_protocols_status ON public.research_ethics_protocols(status);

-- ===========================================
-- TRIGGERS
-- ===========================================
CREATE TRIGGER update_ethics_protocols_updated_at
  BEFORE UPDATE ON public.research_ethics_protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_nodes_updated_at
  BEFORE UPDATE ON public.knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interdisciplinary_calls_updated_at
  BEFORE UPDATE ON public.interdisciplinary_calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();