
-- Institution Applications table
CREATE TABLE public.institution_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  country TEXT NOT NULL,
  domain_focus TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  estimated_members INTEGER NOT NULL DEFAULT 50,
  verification_doc_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  institution_code TEXT UNIQUE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.institution_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.institution_applications
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Users can submit applications" ON public.institution_applications
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all applications" ON public.institution_applications
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update applications" ON public.institution_applications
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Institution Rewards table
CREATE TABLE public.institution_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'visibility_boost', 'featured_placement', 'liquidity_priority')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('deal_milestones', 'high_trust_avg', 'low_dispute_rate', 'economic_growth')),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.institution_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards" ON public.institution_rewards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage rewards" ON public.institution_rewards
  FOR ALL USING (public.is_admin(auth.uid()));

-- Campus Leaderboard materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_campus_leaderboard AS
SELECT
  om.org_id AS institution_id,
  om.user_id,
  p.full_name,
  p.first_name,
  p.last_name,
  COALESCE(utp.trust_score, 0) AS trust_score,
  COALESCE(utp.total_projects_completed, 0) AS projects_completed,
  COALESCE(w.total_earned, 0) AS total_earned,
  COALESCE(utp.successful_rate, 0) AS success_rate
FROM organization_members om
JOIN profiles p ON p.id = om.user_id
LEFT JOIN user_trust_profiles utp ON utp.user_id = om.user_id
LEFT JOIN wallets w ON w.user_id = om.user_id
WHERE om.status = 'active';

CREATE UNIQUE INDEX idx_mv_campus_leaderboard ON public.mv_campus_leaderboard (institution_id, user_id);

-- Index for institution applications
CREATE INDEX idx_institution_applications_status ON public.institution_applications(status, created_at DESC);
CREATE INDEX idx_institution_rewards_org ON public.institution_rewards(institution_id, is_active);
