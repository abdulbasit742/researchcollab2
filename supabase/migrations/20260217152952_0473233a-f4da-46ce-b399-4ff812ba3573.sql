
-- REIOS: Research Execution & Impact Operating System

-- 1. Research Execution Tracks
CREATE TABLE public.research_execution_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  execution_scope JSONB DEFAULT '{}',
  commercialization_path TEXT,
  funding_required NUMERIC DEFAULT 0,
  funding_secured NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  deal_room_id UUID,
  lead_researcher_id UUID,
  institution_id UUID,
  talent_allocated INTEGER DEFAULT 0,
  region_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_execution_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view execution tracks" ON public.research_execution_tracks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Researchers can create execution tracks" ON public.research_execution_tracks FOR INSERT WITH CHECK (auth.uid() = lead_researcher_id);
CREATE POLICY "Lead researcher can update" ON public.research_execution_tracks FOR UPDATE USING (auth.uid() = lead_researcher_id);
CREATE INDEX idx_ret_research ON public.research_execution_tracks(research_id);
CREATE INDEX idx_ret_status ON public.research_execution_tracks(status);
CREATE INDEX idx_ret_institution ON public.research_execution_tracks(institution_id);

-- 2. Research Milestones
CREATE TABLE public.research_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.research_execution_tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  milestone_order INTEGER DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  escrow_locked BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_by UUID,
  deliverable_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view research milestones" ON public.research_milestones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Track lead can manage milestones" ON public.research_milestones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.research_execution_tracks WHERE id = track_id AND lead_researcher_id = auth.uid())
);
CREATE POLICY "Track lead can update milestones" ON public.research_milestones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.research_execution_tracks WHERE id = track_id AND lead_researcher_id = auth.uid())
);
CREATE INDEX idx_rm_track ON public.research_milestones(track_id);
CREATE INDEX idx_rm_status ON public.research_milestones(status);

-- 3. Research Funding Rounds
CREATE TABLE public.research_funding_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.research_execution_tracks(id) ON DELETE CASCADE,
  funder_id UUID,
  funding_pool_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  funding_type TEXT DEFAULT 'grant',
  status TEXT NOT NULL DEFAULT 'pending',
  terms JSONB DEFAULT '{}',
  royalty_percentage NUMERIC DEFAULT 0,
  revenue_share_percentage NUMERIC DEFAULT 0,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_funding_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view funding rounds" ON public.research_funding_rounds FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Funders can create rounds" ON public.research_funding_rounds FOR INSERT WITH CHECK (auth.uid() = funder_id);
CREATE POLICY "Funders can update rounds" ON public.research_funding_rounds FOR UPDATE USING (auth.uid() = funder_id);
CREATE INDEX idx_rfr_track ON public.research_funding_rounds(track_id);
CREATE INDEX idx_rfr_pool ON public.research_funding_rounds(funding_pool_id);

-- 4. Research Commercialization Ledger
CREATE TABLE public.research_commercialization_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.research_execution_tracks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  counterparty TEXT,
  institution_id UUID,
  ip_licensing BOOLEAN DEFAULT false,
  revenue_share_paid NUMERIC DEFAULT 0,
  description TEXT,
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_commercialization_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view ledger" ON public.research_commercialization_ledger FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Track lead can log entries" ON public.research_commercialization_ledger FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.research_execution_tracks WHERE id = track_id AND lead_researcher_id = auth.uid())
);
CREATE INDEX idx_rcl_track ON public.research_commercialization_ledger(track_id);
CREATE INDEX idx_rcl_institution ON public.research_commercialization_ledger(institution_id);

-- 5. Research Implementation Metrics (IIS)
CREATE TABLE public.research_implementation_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID NOT NULL,
  researcher_id UUID,
  implementation_impact_score NUMERIC DEFAULT 0,
  funded_projects_count INTEGER DEFAULT 0,
  milestones_completed INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  institutional_adoptions INTEGER DEFAULT 0,
  cross_border_implementations INTEGER DEFAULT 0,
  verified_deliverables INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(research_id)
);
ALTER TABLE public.research_implementation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view metrics" ON public.research_implementation_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_rim_researcher ON public.research_implementation_metrics(researcher_id);
CREATE INDEX idx_rim_score ON public.research_implementation_metrics(implementation_impact_score DESC);

-- 6. Institutional Research Productivity
CREATE TABLE public.institution_research_productivity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  period TEXT NOT NULL,
  research_executed_pct NUMERIC DEFAULT 0,
  revenue_per_project NUMERIC DEFAULT 0,
  funding_conversion_rate NUMERIC DEFAULT 0,
  student_participation_rate NUMERIC DEFAULT 0,
  deal_completion_reliability NUMERIC DEFAULT 0,
  capital_efficiency NUMERIC DEFAULT 0,
  grade TEXT DEFAULT 'B',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, period)
);
ALTER TABLE public.institution_research_productivity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view institutional metrics" ON public.institution_research_productivity FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_irp_institution ON public.institution_research_productivity(institution_id);
CREATE INDEX idx_irp_grade ON public.institution_research_productivity(grade);

-- 7. Research Adoption Logs
CREATE TABLE public.research_adoption_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID NOT NULL,
  adopter_type TEXT NOT NULL,
  adopter_id UUID,
  adopter_name TEXT,
  sector TEXT,
  region_code TEXT,
  revenue_impact NUMERIC DEFAULT 0,
  time_to_market_days INTEGER,
  adoption_evidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_adoption_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view adoption logs" ON public.research_adoption_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can log adoptions" ON public.research_adoption_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_ral_research ON public.research_adoption_logs(research_id);
CREATE INDEX idx_ral_region ON public.research_adoption_logs(region_code);
CREATE INDEX idx_ral_sector ON public.research_adoption_logs(sector);
