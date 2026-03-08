
-- Sponsor Intake Sessions: tracks AI-driven sponsor problem capture
CREATE TABLE public.omni_sponsor_intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID,
  conversation_id UUID,
  channel_type TEXT DEFAULT 'webchat',
  raw_input TEXT NOT NULL,
  structured_problem JSONB,
  problem_title TEXT,
  domain_category TEXT,
  required_expertise TEXT[],
  budget_range TEXT,
  timeline TEXT,
  expected_outcomes TEXT,
  ai_confidence NUMERIC(5,2),
  clarity_score NUMERIC(5,2),
  fundability_score NUMERIC(5,2),
  gpe_problem_id UUID,
  intake_status TEXT DEFAULT 'captured' CHECK (intake_status IN ('captured','structuring','review','approved','submitted_to_gpe','rejected')),
  operator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.omni_sponsor_intake_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage sponsor intakes" ON public.omni_sponsor_intake_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Institution Onboarding Sessions: tracks AI-guided institution setup
CREATE TABLE public.omni_institution_onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID,
  conversation_id UUID,
  channel_type TEXT DEFAULT 'webchat',
  institution_name TEXT,
  institution_type TEXT,
  country TEXT,
  departments JSONB DEFAULT '[]',
  labs JSONB DEFAULT '[]',
  faculty_contacts JSONB DEFAULT '[]',
  onboarding_step TEXT DEFAULT 'intro' CHECK (onboarding_step IN ('intro','institution_details','departments','labs','faculty','verification','complete')),
  completion_pct NUMERIC(5,2) DEFAULT 0,
  ai_summary TEXT,
  linked_organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.omni_institution_onboarding_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage onboarding sessions" ON public.omni_institution_onboarding_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Opportunity Match Log: tracks AI-driven researcher-opportunity matching
CREATE TABLE public.omni_opportunity_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID,
  opportunity_type TEXT DEFAULT 'project',
  opportunity_id UUID,
  opportunity_title TEXT,
  match_score NUMERIC(5,2),
  match_reasons JSONB,
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  clicked BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,
  channel_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.omni_opportunity_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage opportunity matches" ON public.omni_opportunity_matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
