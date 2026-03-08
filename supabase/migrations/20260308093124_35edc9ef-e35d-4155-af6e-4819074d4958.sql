
-- Global Talent Execution Exchange (GTEX)

-- Talent Registry: verified execution-based professional profiles
CREATE TABLE public.gtex_talent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  institution_id uuid,
  domain_expertise text[],
  skills text[],
  geographic_region text,
  trust_score_snapshot numeric DEFAULT 0,
  milestone_completion_rate numeric DEFAULT 0,
  execution_reliability numeric DEFAULT 0,
  total_projects_completed integer DEFAULT 0,
  collaboration_count integer DEFAULT 0,
  availability_status text NOT NULL DEFAULT 'available',
  bio text,
  hourly_rate numeric,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Talent Opportunities: posted by organizations
CREATE TABLE public.gtex_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid NOT NULL,
  organization_id uuid,
  title text NOT NULL,
  description text,
  opportunity_type text NOT NULL DEFAULT 'contract',
  domain text,
  required_skills text[],
  min_trust_score numeric DEFAULT 0,
  compensation_range_min numeric,
  compensation_range_max numeric,
  timeline_weeks integer,
  milestones_planned integer DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  applications_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Talent Applications
CREATE TABLE public.gtex_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES public.gtex_opportunities(id) ON DELETE CASCADE NOT NULL,
  talent_id uuid REFERENCES public.gtex_talent_profiles(id) ON DELETE CASCADE NOT NULL,
  cover_note text,
  proposed_rate numeric,
  proposed_timeline_weeks integer,
  status text NOT NULL DEFAULT 'pending',
  match_score numeric,
  match_explanation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE(opportunity_id, talent_id)
);

-- Saved Candidates (org bookmarks)
CREATE TABLE public.gtex_saved_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_by uuid NOT NULL,
  talent_id uuid REFERENCES public.gtex_talent_profiles(id) ON DELETE CASCADE NOT NULL,
  notes text,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(saved_by, talent_id)
);

-- Execution Contracts
CREATE TABLE public.gtex_execution_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES public.gtex_opportunities(id),
  organization_id uuid,
  talent_id uuid REFERENCES public.gtex_talent_profiles(id) NOT NULL,
  title text NOT NULL,
  description text,
  milestones jsonb DEFAULT '[]',
  total_compensation numeric DEFAULT 0,
  timeline_weeks integer,
  status text NOT NULL DEFAULT 'draft',
  signed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI Match Results (cached recommendations)
CREATE TABLE public.gtex_ai_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES public.gtex_opportunities(id) ON DELETE CASCADE NOT NULL,
  talent_id uuid REFERENCES public.gtex_talent_profiles(id) ON DELETE CASCADE NOT NULL,
  confidence_score numeric NOT NULL DEFAULT 0,
  match_reasons jsonb DEFAULT '[]',
  recommended_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.gtex_talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtex_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtex_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtex_saved_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtex_execution_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtex_ai_matches ENABLE ROW LEVEL SECURITY;

-- Talent profiles: public read, own write
CREATE POLICY "Anyone can read public talent profiles" ON public.gtex_talent_profiles FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can manage own talent profile" ON public.gtex_talent_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own talent profile" ON public.gtex_talent_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Opportunities: public read, poster writes
CREATE POLICY "Authenticated can read opportunities" ON public.gtex_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can post opportunities" ON public.gtex_opportunities FOR INSERT TO authenticated WITH CHECK (posted_by = auth.uid());
CREATE POLICY "Posters can update own opportunities" ON public.gtex_opportunities FOR UPDATE TO authenticated USING (posted_by = auth.uid());

-- Applications
CREATE POLICY "Authenticated can read applications" ON public.gtex_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Talent can apply" ON public.gtex_applications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Applicants can update own" ON public.gtex_applications FOR UPDATE TO authenticated USING (true);

-- Saved candidates
CREATE POLICY "Users read own saved" ON public.gtex_saved_candidates FOR SELECT TO authenticated USING (saved_by = auth.uid());
CREATE POLICY "Users can save candidates" ON public.gtex_saved_candidates FOR INSERT TO authenticated WITH CHECK (saved_by = auth.uid());
CREATE POLICY "Users can unsave" ON public.gtex_saved_candidates FOR DELETE TO authenticated USING (saved_by = auth.uid());

-- Contracts
CREATE POLICY "Authenticated can read contracts" ON public.gtex_execution_contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create contracts" ON public.gtex_execution_contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Parties can update contracts" ON public.gtex_execution_contracts FOR UPDATE TO authenticated USING (true);

-- AI matches: read-only for authenticated
CREATE POLICY "Authenticated can read AI matches" ON public.gtex_ai_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert AI matches" ON public.gtex_ai_matches FOR INSERT TO authenticated WITH CHECK (true);
