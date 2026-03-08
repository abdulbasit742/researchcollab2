
-- Global Institution Network (GIN)

-- Institution Nodes
CREATE TABLE public.gin_institution_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  institution_name text NOT NULL,
  country text NOT NULL,
  region text,
  institution_type text NOT NULL DEFAULT 'university',
  domains_of_expertise text[],
  departments jsonb DEFAULT '[]',
  labs jsonb DEFAULT '[]',
  website_url text,
  logo_url text,
  verification_status text NOT NULL DEFAULT 'pending',
  node_status text NOT NULL DEFAULT 'active',
  registered_by uuid,
  reputation_score numeric DEFAULT 0,
  project_success_rate numeric DEFAULT 0,
  total_projects integer DEFAULT 0,
  total_funding_received numeric DEFAULT 0,
  total_datasets integer DEFAULT 0,
  total_ventures integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Collaboration edges between institutions
CREATE TABLE public.gin_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_a_id uuid REFERENCES public.gin_institution_nodes(id) ON DELETE CASCADE NOT NULL,
  institution_b_id uuid REFERENCES public.gin_institution_nodes(id) ON DELETE CASCADE NOT NULL,
  collaboration_type text NOT NULL DEFAULT 'joint_research',
  title text,
  description text,
  shared_domains text[],
  strength_score numeric DEFAULT 0,
  project_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(institution_a_id, institution_b_id, collaboration_type)
);

-- Institution Challenge Programs
CREATE TABLE public.gin_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.gin_institution_nodes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  challenge_type text DEFAULT 'research',
  domains text[],
  funding_amount numeric DEFAULT 0,
  max_teams integer,
  application_deadline timestamptz,
  status text NOT NULL DEFAULT 'draft',
  submissions_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Challenge applications
CREATE TABLE public.gin_challenge_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES public.gin_challenges(id) ON DELETE CASCADE NOT NULL,
  applicant_id uuid NOT NULL,
  institution_id uuid REFERENCES public.gin_institution_nodes(id),
  team_name text,
  proposal_summary text,
  team_members jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'submitted',
  review_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, applicant_id)
);

-- Cross-institution teams
CREATE TABLE public.gin_cross_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  description text,
  lead_institution_id uuid REFERENCES public.gin_institution_nodes(id),
  lead_user_id uuid NOT NULL,
  domains text[],
  status text NOT NULL DEFAULT 'forming',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cross-institution team members
CREATE TABLE public.gin_cross_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.gin_cross_teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  institution_id uuid REFERENCES public.gin_institution_nodes(id),
  role text DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- RLS
ALTER TABLE public.gin_institution_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gin_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gin_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gin_challenge_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gin_cross_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gin_cross_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read institution nodes" ON public.gin_institution_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can register institutions" ON public.gin_institution_nodes FOR INSERT TO authenticated WITH CHECK (registered_by = auth.uid());
CREATE POLICY "Registrants can update own institution" ON public.gin_institution_nodes FOR UPDATE TO authenticated USING (registered_by = auth.uid());

CREATE POLICY "Anyone can read collaborations" ON public.gin_collaborations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create collaborations" ON public.gin_collaborations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read challenges" ON public.gin_challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators can manage challenges" ON public.gin_challenges FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators can update challenges" ON public.gin_challenges FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Authenticated can read applications" ON public.gin_challenge_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can apply" ON public.gin_challenge_applications FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Authenticated can read teams" ON public.gin_cross_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create teams" ON public.gin_cross_teams FOR INSERT TO authenticated WITH CHECK (lead_user_id = auth.uid());
CREATE POLICY "Leads can update teams" ON public.gin_cross_teams FOR UPDATE TO authenticated USING (lead_user_id = auth.uid());

CREATE POLICY "Authenticated can read team members" ON public.gin_cross_team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can join teams" ON public.gin_cross_team_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
