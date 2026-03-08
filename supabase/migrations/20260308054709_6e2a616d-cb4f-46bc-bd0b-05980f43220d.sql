
-- =============================================
-- INNOVATION LAYERS — 10 Additive Systems
-- =============================================

-- 1. GLOBAL PROBLEM REGISTRY (GPR)
CREATE TABLE public.global_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text,
  severity_score integer DEFAULT 50,
  affected_population text,
  research_coverage_score integer DEFAULT 0,
  funding_availability text DEFAULT 'low',
  commercialization_potential text DEFAULT 'low',
  proposed_by uuid,
  institution_id uuid,
  status text DEFAULT 'proposed',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.global_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view global problems" ON public.global_problems FOR SELECT USING (true);
CREATE POLICY "Authenticated users can propose problems" ON public.global_problems FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.problem_project_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid REFERENCES public.global_problems(id) ON DELETE CASCADE NOT NULL,
  project_id uuid NOT NULL,
  linked_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.problem_project_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view problem links" ON public.problem_project_links FOR SELECT USING (true);
CREATE POLICY "Auth users can link" ON public.problem_project_links FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.problem_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid REFERENCES public.global_problems(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid NOT NULL,
  vote_type text DEFAULT 'support',
  created_at timestamptz DEFAULT now(),
  UNIQUE(problem_id, voter_id)
);
ALTER TABLE public.problem_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" ON public.problem_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON public.problem_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);

-- 2. RESEARCH OPPORTUNITY ENGINE (ROE)
CREATE TABLE public.research_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  problem_id uuid REFERENCES public.global_problems(id),
  research_gap_score integer DEFAULT 50,
  market_potential text DEFAULT 'medium',
  funding_interest text DEFAULT 'medium',
  suggested_institutions text[] DEFAULT '{}',
  source_type text DEFAULT 'ai_detected',
  domain text,
  region text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view opportunities" ON public.research_opportunities FOR SELECT USING (true);
CREATE POLICY "Auth insert opportunities" ON public.research_opportunities FOR INSERT TO authenticated WITH CHECK (true);

-- 3. CAPITAL INTELLIGENCE ENGINE (CIE)
CREATE TABLE public.capital_intelligence_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  success_probability numeric DEFAULT 0,
  execution_reliability numeric DEFAULT 0,
  commercialization_likelihood numeric DEFAULT 0,
  team_trust_tier text DEFAULT 'standard',
  recommendation_type text DEFAULT 'neutral',
  reasoning jsonb DEFAULT '{}',
  computed_at timestamptz DEFAULT now()
);
ALTER TABLE public.capital_intelligence_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view CI scores" ON public.capital_intelligence_scores FOR SELECT USING (true);
CREATE POLICY "Auth insert CI" ON public.capital_intelligence_scores FOR INSERT TO authenticated WITH CHECK (true);

-- 4. GLOBAL COLLABORATION MAP (GCM)
CREATE TABLE public.collaboration_map_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type text NOT NULL,
  label text NOT NULL,
  country_code text,
  institution_id uuid,
  domain text,
  active_teams integer DEFAULT 0,
  active_projects integer DEFAULT 0,
  latitude numeric,
  longitude numeric,
  metadata jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.collaboration_map_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view map nodes" ON public.collaboration_map_nodes FOR SELECT USING (true);
CREATE POLICY "Auth insert map nodes" ON public.collaboration_map_nodes FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.collaboration_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_a_id uuid,
  team_b_id uuid,
  reason text,
  compatibility_score numeric DEFAULT 0,
  shared_domains text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.collaboration_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view suggestions" ON public.collaboration_suggestions FOR SELECT USING (true);
CREATE POLICY "Auth insert suggestions" ON public.collaboration_suggestions FOR INSERT TO authenticated WITH CHECK (true);

-- 5. AUTONOMOUS RESEARCH LABS
CREATE TABLE public.research_labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  domain text NOT NULL,
  governance_type text DEFAULT 'democratic',
  status text DEFAULT 'active',
  created_by uuid,
  institution_id uuid,
  member_count integer DEFAULT 0,
  funding_pool_total numeric DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view labs" ON public.research_labs FOR SELECT USING (true);
CREATE POLICY "Auth create labs" ON public.research_labs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update own labs" ON public.research_labs FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE TABLE public.research_lab_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid REFERENCES public.research_labs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_lab_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lab members" ON public.research_lab_members FOR SELECT USING (true);
CREATE POLICY "Auth join labs" ON public.research_lab_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 6. EXECUTION REPUTATION MARKET
CREATE TABLE public.reputation_service_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  service_type text NOT NULL,
  title text NOT NULL,
  description text,
  fee_amount numeric DEFAULT 0,
  min_ecs_required numeric DEFAULT 0,
  availability text DEFAULT 'available',
  completed_count integer DEFAULT 0,
  rating_avg numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reputation_service_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view listings" ON public.reputation_service_listings FOR SELECT USING (true);
CREATE POLICY "Auth create listings" ON public.reputation_service_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);

CREATE TABLE public.reputation_service_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.reputation_service_listings(id) NOT NULL,
  requester_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  status text DEFAULT 'requested',
  rating integer,
  feedback text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE public.reputation_service_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view engagements" ON public.reputation_service_engagements FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = provider_id);
CREATE POLICY "Auth create engagements" ON public.reputation_service_engagements FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

-- 7. PLANETARY RESEARCH TIMELINE
CREATE TABLE public.research_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  event_year integer NOT NULL,
  title text NOT NULL,
  description text,
  event_type text DEFAULT 'milestone',
  is_prediction boolean DEFAULT false,
  confidence numeric DEFAULT 1.0,
  source text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view timeline" ON public.research_timeline_events FOR SELECT USING (true);
CREATE POLICY "Auth add timeline events" ON public.research_timeline_events FOR INSERT TO authenticated WITH CHECK (true);

-- 8. EXECUTION MARKET SIMULATOR
CREATE TABLE public.market_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_type text NOT NULL,
  title text NOT NULL,
  parameters jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  domain text,
  region text,
  run_by uuid,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.market_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view simulations" ON public.market_simulations FOR SELECT USING (true);
CREATE POLICY "Auth run simulations" ON public.market_simulations FOR INSERT TO authenticated WITH CHECK (true);

-- 9. GLOBAL TALENT DISCOVERY ENGINE
CREATE TABLE public.talent_discovery_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  completed_milestones integer DEFAULT 0,
  knowledge_contributions integer DEFAULT 0,
  peer_endorsements integer DEFAULT 0,
  cross_border_collaborations integer DEFAULT 0,
  top_skills text[] DEFAULT '{}',
  domains text[] DEFAULT '{}',
  discovery_score numeric DEFAULT 0,
  availability text DEFAULT 'open',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.talent_discovery_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view talent profiles" ON public.talent_discovery_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.talent_discovery_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.talent_discovery_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.talent_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_user_id uuid NOT NULL,
  recommended_for_type text NOT NULL,
  recommended_for_id uuid NOT NULL,
  match_score numeric DEFAULT 0,
  match_reasons text[] DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.talent_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view talent recs" ON public.talent_recommendations FOR SELECT USING (true);
CREATE POLICY "Auth insert talent recs" ON public.talent_recommendations FOR INSERT TO authenticated WITH CHECK (true);

-- 10. PROOF OF EXECUTION PROTOCOL (PoEP)
CREATE TABLE public.proof_of_execution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  proof_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  verification_hash text,
  verified_at timestamptz,
  verified_by uuid,
  credential_level text DEFAULT 'standard',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.proof_of_execution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view PoE" ON public.proof_of_execution FOR SELECT USING (true);
CREATE POLICY "Auth create PoE" ON public.proof_of_execution FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
