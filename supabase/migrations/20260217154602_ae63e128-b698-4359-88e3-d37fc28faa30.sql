
-- FYP Topic Registry
CREATE TABLE public.fyp_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL,
  department_id UUID REFERENCES public.organizations(id),
  institution_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  scope TEXT,
  skill_requirements TEXT[] DEFAULT '{}',
  estimated_duration TEXT,
  estimated_budget NUMERIC DEFAULT 0,
  max_team_size INTEGER DEFAULT 4,
  commercialization_type TEXT DEFAULT 'internal',
  funding_type TEXT DEFAULT 'internal' CHECK (funding_type IN ('internal','sponsor_ready')),
  implementation_ready BOOLEAN DEFAULT false,
  ip_ownership TEXT DEFAULT 'student' CHECK (ip_ownership IN ('student','shared','sponsor','institution')),
  nda_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'open' CHECK (status IN ('draft','open','assigned','in_progress','completed','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Milestone Templates
CREATE TABLE public.fyp_milestones_template (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.fyp_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestone_order INTEGER NOT NULL DEFAULT 1,
  weight NUMERIC DEFAULT 1,
  deliverable_type TEXT DEFAULT 'document',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Teams
CREATE TABLE public.fyp_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.fyp_topics(id) ON DELETE CASCADE,
  team_name TEXT,
  faculty_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming','approved','active','completed','disbanded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Team Members
CREATE TABLE public.fyp_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.fyp_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('lead','member')),
  skill_match_pct NUMERIC DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Applications
CREATE TABLE public.fyp_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.fyp_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.fyp_teams(id),
  cover_note TEXT,
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Sponsorships
CREATE TABLE public.fyp_sponsorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.fyp_topics(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL,
  pledge_amount NUMERIC NOT NULL DEFAULT 0,
  funded_amount NUMERIC NOT NULL DEFAULT 0,
  ip_agreement TEXT DEFAULT 'shared',
  status TEXT DEFAULT 'pledged' CHECK (status IN ('pledged','locked','active','released','refunded')),
  institution_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Escrow Links
CREATE TABLE public.fyp_escrow_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.fyp_topics(id),
  sponsorship_id UUID REFERENCES public.fyp_sponsorships(id),
  team_id UUID REFERENCES public.fyp_teams(id),
  escrow_amount NUMERIC DEFAULT 0,
  released_amount NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  institutional_share NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','locked','partially_released','released','disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Execution Tracks (milestone instances)
CREATE TABLE public.fyp_execution_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.fyp_topics(id),
  team_id UUID NOT NULL REFERENCES public.fyp_teams(id),
  milestone_template_id UUID REFERENCES public.fyp_milestones_template(id),
  title TEXT NOT NULL,
  milestone_order INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','submitted','under_review','revision_requested','approved','released','disputed')),
  submission_url TEXT,
  submission_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  escrow_amount NUMERIC DEFAULT 0,
  released_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Impact Metrics
CREATE TABLE public.fyp_impact_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestones_completed INTEGER DEFAULT 0,
  funded_projects INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  faculty_rating NUMERIC DEFAULT 0,
  impact_score NUMERIC DEFAULT 0,
  on_time_pct NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.fyp_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_milestones_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_escrow_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_execution_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_impact_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: FYP Topics - readable by all authenticated, writable by faculty
CREATE POLICY "Anyone can view fyp topics" ON public.fyp_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty can create fyp topics" ON public.fyp_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = faculty_id);
CREATE POLICY "Faculty can update own topics" ON public.fyp_topics FOR UPDATE TO authenticated USING (auth.uid() = faculty_id);

-- Milestones template: readable by all, writable by topic faculty
CREATE POLICY "Anyone can view milestone templates" ON public.fyp_milestones_template FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty can manage milestone templates" ON public.fyp_milestones_template FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.fyp_topics WHERE id = topic_id AND faculty_id = auth.uid())
);

-- Teams: readable by all, manageable by members
CREATE POLICY "Anyone can view fyp teams" ON public.fyp_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create teams" ON public.fyp_teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team updates by faculty" ON public.fyp_teams FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fyp_topics WHERE id = topic_id AND faculty_id = auth.uid())
);

-- Team members
CREATE POLICY "Anyone can view team members" ON public.fyp_team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join teams" ON public.fyp_team_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Applications
CREATE POLICY "Applicants and faculty see applications" ON public.fyp_applications FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.fyp_topics WHERE id = topic_id AND faculty_id = auth.uid())
);
CREATE POLICY "Users can apply" ON public.fyp_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Faculty can review applications" ON public.fyp_applications FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fyp_topics WHERE id = topic_id AND faculty_id = auth.uid())
);

-- Sponsorships
CREATE POLICY "Anyone can view sponsorships" ON public.fyp_sponsorships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sponsors can create" ON public.fyp_sponsorships FOR INSERT TO authenticated WITH CHECK (auth.uid() = sponsor_id);
CREATE POLICY "Sponsors can update own" ON public.fyp_sponsorships FOR UPDATE TO authenticated USING (auth.uid() = sponsor_id);

-- Escrow links
CREATE POLICY "Participants can view escrow" ON public.fyp_escrow_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can create escrow" ON public.fyp_escrow_links FOR INSERT TO authenticated WITH CHECK (true);

-- Execution tracks
CREATE POLICY "Anyone can view execution tracks" ON public.fyp_execution_tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can submit milestones" ON public.fyp_execution_tracks FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fyp_team_members WHERE team_id = fyp_execution_tracks.team_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.fyp_topics WHERE id = topic_id AND faculty_id = auth.uid())
);
CREATE POLICY "System can create execution tracks" ON public.fyp_execution_tracks FOR INSERT TO authenticated WITH CHECK (true);

-- Impact metrics
CREATE POLICY "Anyone can view impact metrics" ON public.fyp_impact_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view own metrics" ON public.fyp_impact_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert metrics" ON public.fyp_impact_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_fyp_topics_faculty ON public.fyp_topics(faculty_id);
CREATE INDEX idx_fyp_topics_institution ON public.fyp_topics(institution_id);
CREATE INDEX idx_fyp_topics_status ON public.fyp_topics(status);
CREATE INDEX idx_fyp_teams_topic ON public.fyp_teams(topic_id);
CREATE INDEX idx_fyp_members_team ON public.fyp_team_members(team_id);
CREATE INDEX idx_fyp_members_user ON public.fyp_team_members(user_id);
CREATE INDEX idx_fyp_applications_topic ON public.fyp_applications(topic_id);
CREATE INDEX idx_fyp_applications_user ON public.fyp_applications(user_id);
CREATE INDEX idx_fyp_sponsorships_topic ON public.fyp_sponsorships(topic_id);
CREATE INDEX idx_fyp_execution_topic ON public.fyp_execution_tracks(topic_id);
CREATE INDEX idx_fyp_execution_team ON public.fyp_execution_tracks(team_id);
CREATE INDEX idx_fyp_execution_status ON public.fyp_execution_tracks(status);
CREATE INDEX idx_fyp_impact_user ON public.fyp_impact_metrics(user_id);
