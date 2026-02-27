
-- Create claim_citations table
CREATE TABLE public.claim_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citing_claim_id UUID NOT NULL REFERENCES public.research_claims(id) ON DELETE CASCADE,
  cited_claim_id UUID NOT NULL REFERENCES public.research_claims(id) ON DELETE CASCADE,
  citation_type TEXT NOT NULL DEFAULT 'references',
  workspace_id UUID,
  citing_workspace_id UUID,
  cited_workspace_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(citing_claim_id, cited_claim_id)
);

-- Create claim_influence_metrics table
CREATE TABLE public.claim_influence_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.research_claims(id) ON DELETE CASCADE UNIQUE,
  citation_count INT DEFAULT 0,
  support_count INT DEFAULT 0,
  contradiction_count INT DEFAULT 0,
  extension_count INT DEFAULT 0,
  institution_diversity INT DEFAULT 0,
  cross_border_citations INT DEFAULT 0,
  policy_adoption_count INT DEFAULT 0,
  project_implementation_count INT DEFAULT 0,
  funding_conversion_count INT DEFAULT 0,
  peer_review_validation_count INT DEFAULT 0,
  claim_influence_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.claim_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_influence_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read claim_citations" ON public.claim_citations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert claim_citations" ON public.claim_citations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Auth read claim_influence_metrics" ON public.claim_influence_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth manage claim_influence_metrics" ON public.claim_influence_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_claim_citations_citing ON public.claim_citations(citing_claim_id);
CREATE INDEX idx_claim_citations_cited ON public.claim_citations(cited_claim_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.claim_citations;
