
-- Economic Engine backing tables (Systems 29-36)

-- S29: Value Unit balances per user
CREATE TABLE public.value_unit_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_accumulated numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  decayed_amount numeric NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'emerging' CHECK (tier IN ('emerging','established','trusted','distinguished','exemplary')),
  next_tier_threshold numeric NOT NULL DEFAULT 100,
  percent_to_next_tier numeric NOT NULL DEFAULT 0,
  category_breakdown jsonb NOT NULL DEFAULT '{}',
  last_contribution_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- S29: Individual contribution sources
CREATE TABLE public.value_unit_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  entity_id text NOT NULL,
  entity_type text NOT NULL,
  amount numeric NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1.0,
  earned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- S35: Economic safety profiles
CREATE TABLE public.economic_safety_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low','moderate','elevated','high')),
  verification_level text NOT NULL DEFAULT 'none' CHECK (verification_level IN ('none','basic','standard','enhanced','institutional')),
  flags jsonb NOT NULL DEFAULT '[]',
  cooldowns jsonb NOT NULL DEFAULT '[]',
  throttles jsonb NOT NULL DEFAULT '[]',
  manual_review_required boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- S36: Economic trajectory snapshots
CREATE TABLE public.economic_trajectories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lifetime_metrics jsonb NOT NULL DEFAULT '{}',
  period_metrics jsonb NOT NULL DEFAULT '[]',
  stability_score numeric NOT NULL DEFAULT 50,
  recovery_history jsonb NOT NULL DEFAULT '[]',
  projections jsonb NOT NULL DEFAULT '[]',
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- S32: Incentive alignment state
CREATE TABLE public.incentive_alignment_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_alignment integer NOT NULL DEFAULT 50,
  stakeholder_scores jsonb NOT NULL DEFAULT '{}',
  active_rewards jsonb NOT NULL DEFAULT '[]',
  active_penalties jsonb NOT NULL DEFAULT '[]',
  recommendations jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.value_unit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_unit_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_safety_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_trajectories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_alignment_state ENABLE ROW LEVEL SECURITY;

-- Users can read/write own data
CREATE POLICY "Users can read own value unit balance" ON public.value_unit_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own value unit balance" ON public.value_unit_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own value unit balance" ON public.value_unit_balances FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own value unit sources" ON public.value_unit_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own value unit sources" ON public.value_unit_sources FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own safety profile" ON public.economic_safety_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own safety profile" ON public.economic_safety_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own safety profile" ON public.economic_safety_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own trajectory" ON public.economic_trajectories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own trajectory" ON public.economic_trajectories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trajectory" ON public.economic_trajectories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own incentive state" ON public.incentive_alignment_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own incentive state" ON public.incentive_alignment_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own incentive state" ON public.incentive_alignment_state FOR UPDATE USING (auth.uid() = user_id);

-- Admin access
CREATE POLICY "Admins can read all value unit balances" ON public.value_unit_balances FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can read all safety profiles" ON public.economic_safety_profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update safety profiles" ON public.economic_safety_profiles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can read all trajectories" ON public.economic_trajectories FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can read all incentive states" ON public.incentive_alignment_state FOR SELECT USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_value_unit_sources_user ON public.value_unit_sources(user_id, earned_at DESC);
CREATE INDEX idx_value_unit_balances_tier ON public.value_unit_balances(tier);
CREATE INDEX idx_economic_safety_risk ON public.economic_safety_profiles(risk_level);
