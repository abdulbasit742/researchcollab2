
-- Venture Factory: Startup Candidate Registry
CREATE TABLE public.vf_startup_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  title text NOT NULL,
  description text,
  research_domain text,
  team_lead_id uuid,
  institution_id uuid,
  commercialization_score numeric DEFAULT 0,
  market_opportunity text,
  technology_readiness_level integer DEFAULT 1,
  status text NOT NULL DEFAULT 'identified',
  ai_signal_data jsonb DEFAULT '{}',
  funding_secured numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Venture Factory: Team Members
CREATE TABLE public.vf_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.vf_startup_candidates(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'researcher',
  trust_score_snapshot numeric,
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- Venture Factory: Investors
CREATE TABLE public.vf_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investor_type text NOT NULL DEFAULT 'angel',
  organization_name text,
  investment_focus text[],
  min_investment numeric DEFAULT 0,
  max_investment numeric DEFAULT 0,
  portfolio_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Venture Factory: Investor Interest
CREATE TABLE public.vf_investor_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES public.vf_investors(id) ON DELETE CASCADE NOT NULL,
  candidate_id uuid REFERENCES public.vf_startup_candidates(id) ON DELETE CASCADE NOT NULL,
  interest_level text DEFAULT 'watching',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(investor_id, candidate_id)
);

-- Venture Factory: Incubation Tasks
CREATE TABLE public.vf_incubation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.vf_startup_candidates(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'general',
  assigned_to uuid,
  status text DEFAULT 'todo',
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- RLS
ALTER TABLE public.vf_startup_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vf_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vf_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vf_investor_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vf_incubation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read startup candidates" ON public.vf_startup_candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert startup candidates" ON public.vf_startup_candidates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team leads can update their candidates" ON public.vf_startup_candidates FOR UPDATE TO authenticated USING (team_lead_id = auth.uid());

CREATE POLICY "Authenticated users can read team members" ON public.vf_team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert team members" ON public.vf_team_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read investors" ON public.vf_investors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own investor profile" ON public.vf_investors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own investor profile" ON public.vf_investors FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can read investor interests" ON public.vf_investor_interests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Investors can manage their interests" ON public.vf_investor_interests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read incubation tasks" ON public.vf_incubation_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert incubation tasks" ON public.vf_incubation_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Assigned users can update tasks" ON public.vf_incubation_tasks FOR UPDATE TO authenticated USING (true);
