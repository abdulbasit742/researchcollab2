
-- ═══════════════════════════════════════════════════════════
-- INNOVATION ENGINE: Three New Additive Layers
-- 1. Research Venture Studio
-- 2. Industry Partnership Exchange  
-- 3. Mentorship Economy
-- ═══════════════════════════════════════════════════════════

-- ── 1. Research Venture Studio ──

CREATE TABLE public.venture_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  founder_id UUID,
  venture_name TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  stage TEXT NOT NULL DEFAULT 'ideation',
  ip_status TEXT DEFAULT 'pending',
  funding_target NUMERIC DEFAULT 0,
  funding_raised NUMERIC DEFAULT 0,
  mentor_ids UUID[] DEFAULT '{}',
  milestones_completed INT DEFAULT 0,
  milestones_total INT DEFAULT 4,
  institution_id UUID,
  demo_day_date TIMESTAMPTZ,
  graduation_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.venture_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID REFERENCES public.venture_tracks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT DEFAULT 'deliverable',
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  evidence_url TEXT,
  reviewer_id UUID,
  review_notes TEXT,
  funding_unlocked NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.venture_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID REFERENCES public.venture_tracks(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID NOT NULL,
  role TEXT DEFAULT 'co-founder',
  cover_note TEXT,
  trust_score_snapshot NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Industry Partnership Exchange ──

CREATE TABLE public.industry_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  challenge_type TEXT DEFAULT 'r_and_d',
  budget_amount NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ,
  required_expertise TEXT[] DEFAULT '{}',
  min_trust_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open',
  application_count INT DEFAULT 0,
  posted_by UUID,
  selected_team_id UUID,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.challenge_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.industry_challenges(id) ON DELETE CASCADE NOT NULL,
  proposer_id UUID NOT NULL,
  team_name TEXT,
  proposal_summary TEXT,
  approach TEXT,
  proposed_budget NUMERIC DEFAULT 0,
  proposed_timeline_months INT DEFAULT 3,
  trust_score_snapshot NUMERIC DEFAULT 0,
  team_members UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'submitted',
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Mentorship Economy ──

CREATE TABLE public.mentorship_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  session_rate_amount NUMERIC DEFAULT 0,
  session_duration_minutes INT DEFAULT 60,
  max_mentees INT DEFAULT 5,
  current_mentees INT DEFAULT 0,
  trust_score_snapshot NUMERIC DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  total_sessions INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.mentorship_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.mentorship_listings(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID NOT NULL,
  mentee_id UUID NOT NULL,
  status TEXT DEFAULT 'active',
  goals TEXT,
  sessions_completed INT DEFAULT 0,
  next_session_at TIMESTAMPTZ,
  mentee_rating NUMERIC,
  mentor_rating NUMERIC,
  outcome_summary TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ──

ALTER TABLE public.venture_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_engagements ENABLE ROW LEVEL SECURITY;

-- Venture tracks: public read, auth insert/update own
CREATE POLICY "venture_tracks_select" ON public.venture_tracks FOR SELECT USING (true);
CREATE POLICY "venture_tracks_insert" ON public.venture_tracks FOR INSERT TO authenticated WITH CHECK (founder_id = auth.uid());
CREATE POLICY "venture_tracks_update" ON public.venture_tracks FOR UPDATE TO authenticated USING (founder_id = auth.uid());

-- Venture milestones: public read, auth manage
CREATE POLICY "venture_milestones_select" ON public.venture_milestones FOR SELECT USING (true);
CREATE POLICY "venture_milestones_insert" ON public.venture_milestones FOR INSERT TO authenticated WITH CHECK (true);

-- Venture applications: public read, auth insert own
CREATE POLICY "venture_apps_select" ON public.venture_applications FOR SELECT USING (true);
CREATE POLICY "venture_apps_insert" ON public.venture_applications FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid());

-- Industry challenges: public read, auth insert
CREATE POLICY "challenges_select" ON public.industry_challenges FOR SELECT USING (true);
CREATE POLICY "challenges_insert" ON public.industry_challenges FOR INSERT TO authenticated WITH CHECK (posted_by = auth.uid());
CREATE POLICY "challenges_update" ON public.industry_challenges FOR UPDATE TO authenticated USING (posted_by = auth.uid());

-- Challenge proposals: public read, auth insert own
CREATE POLICY "proposals_select" ON public.challenge_proposals FOR SELECT USING (true);
CREATE POLICY "proposals_insert" ON public.challenge_proposals FOR INSERT TO authenticated WITH CHECK (proposer_id = auth.uid());

-- Mentorship listings: public read, auth manage own
CREATE POLICY "mentorship_listings_select" ON public.mentorship_listings FOR SELECT USING (true);
CREATE POLICY "mentorship_listings_insert" ON public.mentorship_listings FOR INSERT TO authenticated WITH CHECK (mentor_id = auth.uid());
CREATE POLICY "mentorship_listings_update" ON public.mentorship_listings FOR UPDATE TO authenticated USING (mentor_id = auth.uid());

-- Mentorship engagements: participants can read/write
CREATE POLICY "mentorship_engagements_select" ON public.mentorship_engagements FOR SELECT TO authenticated USING (mentor_id = auth.uid() OR mentee_id = auth.uid());
CREATE POLICY "mentorship_engagements_insert" ON public.mentorship_engagements FOR INSERT TO authenticated WITH CHECK (mentee_id = auth.uid());
CREATE POLICY "mentorship_engagements_update" ON public.mentorship_engagements FOR UPDATE TO authenticated USING (mentor_id = auth.uid() OR mentee_id = auth.uid());
