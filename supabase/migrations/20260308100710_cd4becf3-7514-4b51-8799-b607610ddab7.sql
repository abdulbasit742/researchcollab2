
-- Viral Referral & Reputation Loop tables

-- SYSTEM 1: Referral Registry
CREATE TABLE public.vrl_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid,
  invitation_channel text NOT NULL DEFAULT 'link',
  referral_status text NOT NULL DEFAULT 'invited',
  referral_code text NOT NULL,
  converted_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SYSTEM 2: Invitations
CREATE TABLE public.vrl_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_email text,
  recipient_name text,
  channel text NOT NULL DEFAULT 'email',
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  opened_at timestamptz,
  clicked_at timestamptz,
  registered_at timestamptz,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- SYSTEM 3: Referral Rewards
CREATE TABLE public.vrl_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referral_id uuid REFERENCES public.vrl_referrals(id),
  reward_type text NOT NULL,
  reward_value numeric DEFAULT 0,
  description text,
  status text NOT NULL DEFAULT 'pending',
  granted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- SYSTEM 5: Influence Scores
CREATE TABLE public.vrl_influence_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  referral_score numeric DEFAULT 0,
  collaboration_score numeric DEFAULT 0,
  team_participation_score numeric DEFAULT 0,
  institution_invite_score numeric DEFAULT 0,
  overall_influence numeric DEFAULT 0,
  tier text DEFAULT 'explorer',
  computed_at timestamptz NOT NULL DEFAULT now()
);

-- SYSTEM 8: Institution Referral Program
CREATE TABLE public.vrl_institution_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_institution_id uuid,
  referred_institution_id uuid,
  referred_by_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'invited',
  partnership_type text DEFAULT 'collaboration',
  converted_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- SYSTEM 9: Viral Growth Feed
CREATE TABLE public.vrl_growth_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id uuid,
  actor_name text,
  entity_type text,
  entity_id uuid,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vrl_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vrl_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vrl_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vrl_influence_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vrl_institution_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vrl_growth_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can read their own data and public feed
CREATE POLICY "Users can read own referrals" ON public.vrl_referrals FOR SELECT TO authenticated USING (referrer_user_id = auth.uid() OR referred_user_id = auth.uid());
CREATE POLICY "Users can create referrals" ON public.vrl_referrals FOR INSERT TO authenticated WITH CHECK (referrer_user_id = auth.uid());
CREATE POLICY "Users can update own referrals" ON public.vrl_referrals FOR UPDATE TO authenticated USING (referrer_user_id = auth.uid());

CREATE POLICY "Users can read own invitations" ON public.vrl_invitations FOR SELECT TO authenticated USING (sender_id = auth.uid());
CREATE POLICY "Users can create invitations" ON public.vrl_invitations FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can read own rewards" ON public.vrl_rewards FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can read own influence" ON public.vrl_influence_scores FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can read all influence scores" ON public.vrl_influence_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read own institution referrals" ON public.vrl_institution_referrals FOR SELECT TO authenticated USING (referred_by_user_id = auth.uid());
CREATE POLICY "Users can create institution referrals" ON public.vrl_institution_referrals FOR INSERT TO authenticated WITH CHECK (referred_by_user_id = auth.uid());

CREATE POLICY "Anyone can read public growth feed" ON public.vrl_growth_feed FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Authenticated can insert growth feed" ON public.vrl_growth_feed FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for growth feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.vrl_growth_feed;
