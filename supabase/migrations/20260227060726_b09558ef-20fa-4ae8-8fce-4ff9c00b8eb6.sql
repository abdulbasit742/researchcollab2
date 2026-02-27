
-- Structured professional relationships (replaces generic "connections")
CREATE TABLE IF NOT EXISTS public.trust_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL,
  target_id uuid NOT NULL,
  relationship_type text NOT NULL,
  linked_project_id uuid,
  escrow_volume numeric DEFAULT 0,
  successful_completions integer DEFAULT 0,
  dispute_count integer DEFAULT 0,
  communication_quality_score numeric DEFAULT 0,
  repeat_collaboration_count integer DEFAULT 0,
  trust_edge_score numeric DEFAULT 0,
  first_interaction_at timestamptz DEFAULT now(),
  last_interaction_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(source_id, target_id, relationship_type)
);

ALTER TABLE public.trust_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trust edges"
  ON public.trust_edges FOR SELECT
  TO authenticated
  USING (source_id = auth.uid() OR target_id = auth.uid());

CREATE POLICY "Public trust edges visible"
  ON public.trust_edges FOR SELECT
  TO authenticated
  USING (true);

-- Reputation index snapshots
CREATE TABLE IF NOT EXISTS public.reputation_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  execution_reliability numeric DEFAULT 0,
  economic_trust numeric DEFAULT 0,
  institutional_validation numeric DEFAULT 0,
  sponsor_confidence numeric DEFAULT 0,
  communication_stability numeric DEFAULT 0,
  dispute_risk numeric DEFAULT 0,
  overall_reputation numeric DEFAULT 0,
  tier text DEFAULT 'unestablished',
  network_depth_score numeric DEFAULT 0,
  network_diversity_score numeric DEFAULT 0,
  network_stability_score numeric DEFAULT 0,
  collaboration_recurrence_rate numeric DEFAULT 0,
  economic_influence_score numeric DEFAULT 0,
  total_escrow_influenced numeric DEFAULT 0,
  cross_institution_reach integer DEFAULT 0,
  snapshot_at timestamptz DEFAULT now()
);

ALTER TABLE public.reputation_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reputation publicly visible"
  ON public.reputation_index FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users manage own reputation"
  ON public.reputation_index FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Collaboration clusters
CREATE TABLE IF NOT EXISTS public.collaboration_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_name text NOT NULL,
  domain_category text,
  member_ids uuid[] DEFAULT '{}',
  institution_ids uuid[] DEFAULT '{}',
  sponsor_ids uuid[] DEFAULT '{}',
  total_escrow_volume numeric DEFAULT 0,
  avg_trust_edge_score numeric DEFAULT 0,
  project_count integer DEFAULT 0,
  dispute_free_rate numeric DEFAULT 0,
  detected_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.collaboration_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clusters publicly visible"
  ON public.collaboration_clusters FOR SELECT
  TO authenticated
  USING (true);

-- Professional stability tracking
CREATE TABLE IF NOT EXISTS public.professional_stability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period text NOT NULL,
  relationship_retention_rate numeric DEFAULT 0,
  sponsor_churn_rate numeric DEFAULT 0,
  institutional_loyalty_score numeric DEFAULT 0,
  collaboration_continuity numeric DEFAULT 0,
  repeat_deal_density numeric DEFAULT 0,
  trust_edge_growth integer DEFAULT 0,
  cross_domain_expansion integer DEFAULT 0,
  economic_centrality numeric DEFAULT 0,
  snapshot_at timestamptz DEFAULT now()
);

ALTER TABLE public.professional_stability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stability publicly visible"
  ON public.professional_stability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users manage own stability"
  ON public.professional_stability FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
