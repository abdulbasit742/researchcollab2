
-- Institutional Enrollment Records
CREATE TABLE public.institutional_enrollment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_status TEXT NOT NULL DEFAULT 'pending' CHECK (enrollment_status IN ('pending', 'active', 'inactive')),
  activation_score INTEGER NOT NULL DEFAULT 0,
  profile_completion_pct INTEGER NOT NULL DEFAULT 0,
  first_bid_at TIMESTAMPTZ,
  first_deal_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, user_id)
);

ALTER TABLE public.institutional_enrollment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollment" ON public.institutional_enrollment_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Institution admins can view enrollments" ON public.institutional_enrollment_records
  FOR SELECT USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE POLICY "Institution admins can manage enrollments" ON public.institutional_enrollment_records
  FOR ALL USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE POLICY "Users can insert own enrollment" ON public.institutional_enrollment_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access enrollments" ON public.institutional_enrollment_records
  FOR ALL USING (public.is_admin(auth.uid()));

-- Institutional Targets
CREATE TABLE public.institutional_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  target_deals INTEGER NOT NULL DEFAULT 0,
  target_revenue NUMERIC NOT NULL DEFAULT 0,
  target_trust_average INTEGER NOT NULL DEFAULT 50,
  quarter TEXT NOT NULL,
  current_deals INTEGER NOT NULL DEFAULT 0,
  current_revenue NUMERIC NOT NULL DEFAULT 0,
  current_trust_average INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, quarter)
);

ALTER TABLE public.institutional_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins can manage targets" ON public.institutional_targets
  FOR ALL USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE POLICY "Admins full access targets" ON public.institutional_targets
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Members can view targets" ON public.institutional_targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE org_id = institution_id AND user_id = auth.uid()
    )
  );

-- Institutional Economic Score
CREATE TABLE public.institutional_economic_scores (
  institution_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  economic_output_score NUMERIC NOT NULL DEFAULT 0,
  trust_score_average NUMERIC NOT NULL DEFAULT 0,
  deal_completion_rate NUMERIC NOT NULL DEFAULT 0,
  liquidity_contribution NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_deals INTEGER NOT NULL DEFAULT 0,
  active_members INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.institutional_economic_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read economic scores" ON public.institutional_economic_scores
  FOR SELECT USING (true);

CREATE POLICY "Admins manage economic scores" ON public.institutional_economic_scores
  FOR ALL USING (public.is_admin(auth.uid()));

-- Institutional Badges
CREATE TABLE public.institutional_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'verified_economic_contributor', 'high_trust_institution', 'zero_dispute_institution',
    'emerging_talent_hub', 'elite_execution_campus'
  )),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(institution_id, badge_type)
);

ALTER TABLE public.institutional_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read badges" ON public.institutional_badges
  FOR SELECT USING (true);

CREATE POLICY "Admins manage badges" ON public.institutional_badges
  FOR ALL USING (public.is_admin(auth.uid()));

-- Institutional Intervention Logs
CREATE TABLE public.institutional_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('inactive_14d', 'no_bid_after_onboard', 'bid_rejected_3x', 'milestone_abandoned')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'resolved', 'escalated')),
  ai_nudge_sent BOOLEAN DEFAULT false,
  faculty_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.institutional_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins can view interventions" ON public.institutional_interventions
  FOR SELECT USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE POLICY "Admins full access interventions" ON public.institutional_interventions
  FOR ALL USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_enrollment_institution ON public.institutional_enrollment_records(institution_id, enrollment_status);
CREATE INDEX idx_enrollment_user ON public.institutional_enrollment_records(user_id);
CREATE INDEX idx_targets_institution ON public.institutional_targets(institution_id, quarter);
CREATE INDEX idx_interventions_institution ON public.institutional_interventions(institution_id, status);
CREATE INDEX idx_badges_institution ON public.institutional_badges(institution_id);
