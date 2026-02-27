
-- SDDE: Structured Discourse & Debate Engine

-- 1. Discussion Threads
CREATE TABLE public.sdde_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_type TEXT NOT NULL DEFAULT 'open_qa',
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  expected_outcome TEXT,
  evidence_requirement TEXT DEFAULT 'encouraged',
  moderator_id UUID,
  linked_entity_id UUID,
  linked_entity_type TEXT,
  status TEXT DEFAULT 'open',
  is_institutional BOOLEAN DEFAULT false,
  institution_id UUID,
  region_tags TEXT[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Contributions (Arguments)
CREATE TABLE public.sdde_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.sdde_threads(id) NOT NULL,
  parent_id UUID REFERENCES public.sdde_contributions(id),
  author_id UUID NOT NULL,
  contribution_type TEXT NOT NULL DEFAULT 'claim',
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  data_references JSONB DEFAULT '[]',
  project_references JSONB DEFAULT '[]',
  domain_authority_score NUMERIC DEFAULT 0,
  trust_index NUMERIC DEFAULT 0,
  evidence_backed BOOLEAN DEFAULT false,
  visibility_weight NUMERIC DEFAULT 1,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Evidence Registry
CREATE TABLE public.sdde_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID REFERENCES public.sdde_contributions(id) NOT NULL,
  evidence_type TEXT NOT NULL DEFAULT 'citation',
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  source_credibility NUMERIC DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AI Thread Summaries
CREATE TABLE public.sdde_ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.sdde_threads(id) NOT NULL,
  key_claims JSONB DEFAULT '[]',
  strongest_evidence JSONB DEFAULT '[]',
  unresolved_questions JSONB DEFAULT '[]',
  consensus_areas JSONB DEFAULT '[]',
  disagreement_zones JSONB DEFAULT '[]',
  risk_highlights JSONB DEFAULT '[]',
  actionable_conclusions JSONB DEFAULT '[]',
  suggested_next_steps JSONB DEFAULT '[]',
  linked_projects JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Dispute Resolution
CREATE TABLE public.sdde_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.sdde_threads(id) NOT NULL,
  initiated_by UUID NOT NULL,
  dispute_summary TEXT NOT NULL,
  rebuttal_format JSONB DEFAULT '{}',
  evidence_comparison JSONB DEFAULT '{}',
  moderator_id UUID,
  consensus_vote JSONB DEFAULT '{}',
  outcome_label TEXT DEFAULT 'ongoing',
  resolution_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 6. Toxicity Flags
CREATE TABLE public.sdde_toxicity_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID REFERENCES public.sdde_contributions(id) NOT NULL,
  flag_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  flagged_by TEXT DEFAULT 'ai',
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- 7. Knowledge Extraction
CREATE TABLE public.sdde_knowledge_extracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.sdde_threads(id) NOT NULL,
  extract_type TEXT NOT NULL DEFAULT 'document',
  title TEXT NOT NULL,
  content TEXT,
  linked_project_id UUID,
  linked_institution_id UUID,
  linked_grant_id UUID,
  extracted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Discussion Impact Index
CREATE TABLE public.sdde_impact_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.sdde_threads(id) NOT NULL,
  evidence_density NUMERIC DEFAULT 0,
  authority_participation NUMERIC DEFAULT 0,
  outcome_clarity NUMERIC DEFAULT 0,
  action_items_generated INTEGER DEFAULT 0,
  institutional_integration BOOLEAN DEFAULT false,
  citation_growth INTEGER DEFAULT 0,
  long_term_reference_rate NUMERIC DEFAULT 0,
  implementation_influence NUMERIC DEFAULT 0,
  composite_impact NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Thread Archive
CREATE TABLE public.sdde_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.sdde_threads(id) NOT NULL,
  argument_tree JSONB DEFAULT '{}',
  evidence_links JSONB DEFAULT '[]',
  resolution_outcome TEXT,
  moderator_notes TEXT,
  citation_growth INTEGER DEFAULT 0,
  related_projects JSONB DEFAULT '[]',
  versioned_summaries JSONB DEFAULT '[]',
  archived_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tone Assistance Log
CREATE TABLE public.sdde_tone_assists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  thread_id UUID REFERENCES public.sdde_threads(id),
  original_text TEXT NOT NULL,
  suggested_text TEXT,
  suggestion_type TEXT NOT NULL,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.sdde_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_toxicity_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_knowledge_extracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_impact_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sdde_tone_assists ENABLE ROW LEVEL SECURITY;

-- Read
CREATE POLICY "sdde_threads_read" ON public.sdde_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_contribs_read" ON public.sdde_contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_evidence_read" ON public.sdde_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_summaries_read" ON public.sdde_ai_summaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_disputes_read" ON public.sdde_disputes FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_toxicity_read" ON public.sdde_toxicity_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_knowledge_read" ON public.sdde_knowledge_extracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_impact_read" ON public.sdde_impact_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_archives_read" ON public.sdde_archives FOR SELECT TO authenticated USING (true);
CREATE POLICY "sdde_tone_read" ON public.sdde_tone_assists FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Insert
CREATE POLICY "sdde_threads_insert" ON public.sdde_threads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_contribs_insert" ON public.sdde_contributions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_evidence_insert" ON public.sdde_evidence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_summaries_insert" ON public.sdde_ai_summaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_disputes_insert" ON public.sdde_disputes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_toxicity_insert" ON public.sdde_toxicity_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_knowledge_insert" ON public.sdde_knowledge_extracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_impact_insert" ON public.sdde_impact_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_archives_insert" ON public.sdde_archives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sdde_tone_insert" ON public.sdde_tone_assists FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Update
CREATE POLICY "sdde_threads_update" ON public.sdde_threads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sdde_contribs_update" ON public.sdde_contributions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sdde_disputes_update" ON public.sdde_disputes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sdde_toxicity_update" ON public.sdde_toxicity_flags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
