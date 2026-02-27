
-- =====================================================
-- EXECUTION-FIRST VISUAL NETWORK — EXTENSIONS
-- Collaboration requests, domain discovery, learning modules, AI relevance
-- =====================================================

-- 1. Collaboration Requests (Section 7)
CREATE TABLE IF NOT EXISTS public.visual_collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  target_user_id UUID,
  target_institution_id TEXT,
  portfolio_item_id UUID,
  request_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  funding_offer NUMERIC,
  skill_requirements TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Domain Discovery Categories (Section 5)
CREATE TABLE IF NOT EXISTS public.visual_discovery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_type TEXT NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Learning Modules from Content (Section 14)
CREATE TABLE IF NOT EXISTS public.execution_learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  module_type TEXT NOT NULL,
  description TEXT,
  source_portfolio_id UUID,
  source_project_id TEXT,
  content_blocks JSONB DEFAULT '[]',
  skill_tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'intermediate',
  estimated_minutes INTEGER DEFAULT 15,
  completion_count INTEGER DEFAULT 0,
  rating_avg NUMERIC DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AI Content Recommendations (Section 10)
CREATE TABLE IF NOT EXISTS public.ai_content_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommended_entity_type TEXT NOT NULL,
  recommended_entity_id TEXT NOT NULL,
  relevance_score NUMERIC NOT NULL DEFAULT 0,
  recommendation_reason TEXT,
  domain_match BOOLEAN DEFAULT false,
  emerging_innovator BOOLEAN DEFAULT false,
  suppressed_viral_bias BOOLEAN DEFAULT true,
  was_interacted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Global Innovation Map Points (Section 13)
CREATE TABLE IF NOT EXISTS public.innovation_map_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_type TEXT NOT NULL,
  label TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  country_code TEXT,
  institution_id TEXT,
  intensity NUMERIC DEFAULT 1.0,
  active_projects INTEGER DEFAULT 0,
  total_funding NUMERIC DEFAULT 0,
  collaboration_density NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visual_collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_discovery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_map_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth read collab_requests" ON public.visual_collaboration_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert collab_requests" ON public.visual_collaboration_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Auth update collab_requests" ON public.visual_collaboration_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = target_user_id);

CREATE POLICY "Anyone read discovery_cats" ON public.visual_discovery_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert discovery_cats" ON public.visual_discovery_categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read learning_modules" ON public.execution_learning_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert learning_modules" ON public.execution_learning_modules FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Auth update learning_modules" ON public.execution_learning_modules FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Own read ai_recs" ON public.ai_content_recommendations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert ai_recs" ON public.ai_content_recommendations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read innovation_map" ON public.innovation_map_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert innovation_map" ON public.innovation_map_points FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anon read innovation_map" ON public.innovation_map_points FOR SELECT TO anon USING (is_active = true);
