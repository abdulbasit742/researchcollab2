
-- =====================================================
-- MICRO-EXECUTION VIDEO INTELLIGENCE SYSTEM
-- =====================================================

-- 1. Micro-Execution Videos (Section 1, 2)
CREATE TABLE IF NOT EXISTS public.micro_execution_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  domain_tags TEXT[] DEFAULT '{}',
  skill_tags TEXT[] DEFAULT '{}',
  execution_phase TEXT,
  project_link TEXT,
  funding_relevance BOOLEAN DEFAULT false,
  collaboration_opportunity BOOLEAN DEFAULT false,
  innovation_category TEXT,
  duration_seconds INTEGER NOT NULL,
  depth_tier TEXT NOT NULL DEFAULT 'insight_snap',
  difficulty_level TEXT DEFAULT 'intermediate',
  related_doc_link TEXT,
  linked_entity_type TEXT,
  linked_entity_id TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Video Quality Index (Section 12)
CREATE TABLE IF NOT EXISTS public.video_quality_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.micro_execution_videos(id),
  clarity_score NUMERIC DEFAULT 0,
  technical_depth NUMERIC DEFAULT 0,
  innovation_signal NUMERIC DEFAULT 0,
  collaboration_signal NUMERIC DEFAULT 0,
  skill_articulation NUMERIC DEFAULT 0,
  long_term_relevance NUMERIC DEFAULT 0,
  composite_quality NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Video Value Rankings (Section 3)
CREATE TABLE IF NOT EXISTS public.video_value_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.micro_execution_videos(id),
  skill_demonstration NUMERIC DEFAULT 0,
  execution_originality NUMERIC DEFAULT 0,
  innovation_depth NUMERIC DEFAULT 0,
  collaboration_potential NUMERIC DEFAULT 0,
  long_term_usefulness NUMERIC DEFAULT 0,
  domain_relevance NUMERIC DEFAULT 0,
  funding_alignment NUMERIC DEFAULT 0,
  peer_validation NUMERIC DEFAULT 0,
  replication_reference NUMERIC DEFAULT 0,
  composite_rank NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Video Sessions (Section 4, 14)
CREATE TABLE IF NOT EXISTS public.video_viewing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  videos_watched INTEGER DEFAULT 0,
  session_size INTEGER DEFAULT 10,
  time_spent_seconds INTEGER DEFAULT 0,
  reflection_response TEXT,
  reflection_category TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 5. Video Comments (Section 7)
CREATE TABLE IF NOT EXISTS public.video_structured_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.micro_execution_videos(id),
  user_id UUID NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  parent_comment_id UUID,
  is_collaboration_offer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Learning Playlists (Section 9)
CREATE TABLE IF NOT EXISTS public.video_learning_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  skill_path TEXT,
  difficulty_progression TEXT[] DEFAULT '{}',
  video_ids UUID[] DEFAULT '{}',
  practice_assignments JSONB DEFAULT '[]',
  milestone_suggestions JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Institutional Video Channels (Section 11)
CREATE TABLE IF NOT EXISTS public.institutional_video_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  video_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.micro_execution_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_quality_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_value_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_viewing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_structured_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_learning_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_video_channels ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Auth read videos" ON public.micro_execution_videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own insert videos" ON public.micro_execution_videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Own update videos" ON public.micro_execution_videos FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Auth read video_quality" ON public.video_quality_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert video_quality" ON public.video_quality_index FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth read video_ranks" ON public.video_value_rankings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert video_ranks" ON public.video_value_rankings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Own read video_sessions" ON public.video_viewing_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert video_sessions" ON public.video_viewing_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update video_sessions" ON public.video_viewing_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Auth read video_comments" ON public.video_structured_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own insert video_comments" ON public.video_structured_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth read playlists" ON public.video_learning_playlists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own insert playlists" ON public.video_learning_playlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Auth read inst_channels" ON public.institutional_video_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert inst_channels" ON public.institutional_video_channels FOR INSERT TO authenticated WITH CHECK (true);
