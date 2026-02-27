
-- Execution visual portfolio items
CREATE TABLE IF NOT EXISTS public.execution_visual_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid,
  title text NOT NULL,
  description text,
  visual_type text NOT NULL DEFAULT 'deliverable',
  media_urls text[] DEFAULT '{}',
  thumbnail_url text,
  escrow_linked boolean DEFAULT false,
  escrow_amount numeric,
  escrow_amount_visible boolean DEFAULT false,
  skills_demonstrated text[] DEFAULT '{}',
  role_played text,
  institutional_validation boolean DEFAULT false,
  institution_id uuid,
  sponsor_validated boolean DEFAULT false,
  sponsor_id uuid,
  faculty_endorsed boolean DEFAULT false,
  performance_outcome text,
  complexity_score numeric DEFAULT 0,
  visual_impact_score numeric DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.execution_visual_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own portfolio" ON public.execution_visual_portfolio
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public portfolio items visible" ON public.execution_visual_portfolio
  FOR SELECT TO authenticated USING (is_public = true);

-- Project lifecycle stories (auto-generated timeline)
CREATE TABLE IF NOT EXISTS public.project_lifecycle_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_title text NOT NULL,
  event_description text,
  media_url text,
  milestone_number integer,
  escrow_stage text,
  is_public boolean DEFAULT true,
  event_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.project_lifecycle_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stories" ON public.project_lifecycle_stories
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public stories visible" ON public.project_lifecycle_stories
  FOR SELECT TO authenticated USING (is_public = true);

-- Institutional showcase channels
CREATE TABLE IF NOT EXISTS public.institutional_showcase_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  channel_name text NOT NULL,
  channel_type text DEFAULT 'innovation',
  description text,
  is_active boolean DEFAULT true,
  follower_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.institutional_showcase_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Channels publicly visible" ON public.institutional_showcase_channels
  FOR SELECT TO authenticated USING (is_active = true);

-- Institutional showcase posts
CREATE TABLE IF NOT EXISTS public.institutional_showcase_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.institutional_showcase_channels(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL,
  posted_by uuid NOT NULL,
  title text NOT NULL,
  content text,
  media_urls text[] DEFAULT '{}',
  post_type text DEFAULT 'highlight',
  linked_project_id uuid,
  sponsor_validated boolean DEFAULT false,
  escrow_impact numeric DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.institutional_showcase_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts visible" ON public.institutional_showcase_posts
  FOR SELECT TO authenticated USING (is_published = true);

-- Visual deliverable discussions
CREATE TABLE IF NOT EXISTS public.visual_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid REFERENCES public.execution_visual_portfolio(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  discussion_type text DEFAULT 'feedback',
  content text NOT NULL,
  is_faculty_review boolean DEFAULT false,
  is_sponsor_comment boolean DEFAULT false,
  parent_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.visual_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussions visible to authenticated" ON public.visual_discussions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users create discussions" ON public.visual_discussions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Execution reels (short-form clips)
CREATE TABLE IF NOT EXISTS public.execution_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  reel_type text NOT NULL DEFAULT 'project_demo',
  video_url text,
  thumbnail_url text,
  linked_project_id uuid,
  linked_portfolio_item_id uuid,
  duration_seconds integer,
  skills_shown text[] DEFAULT '{}',
  visual_impact_score numeric DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.execution_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reels" ON public.execution_reels
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public reels visible" ON public.execution_reels
  FOR SELECT TO authenticated USING (is_public = true);

-- Visual trust badges
CREATE TABLE IF NOT EXISTS public.visual_trust_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  badge_label text NOT NULL,
  earned_via_entity_id uuid,
  earned_via_entity_type text,
  is_active boolean DEFAULT true,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE public.visual_trust_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges publicly visible" ON public.visual_trust_badges
  FOR SELECT TO authenticated USING (is_active = true);

-- Visual Impact Score snapshots
CREATE TABLE IF NOT EXISTS public.visual_impact_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  economic_impact numeric DEFAULT 0,
  sponsor_repeat_score numeric DEFAULT 0,
  institutional_credibility numeric DEFAULT 0,
  complexity_score numeric DEFAULT 0,
  adoption_rate numeric DEFAULT 0,
  industry_recognition numeric DEFAULT 0,
  overall_vis numeric DEFAULT 0,
  tier text DEFAULT 'emerging',
  snapshot_at timestamptz DEFAULT now()
);

ALTER TABLE public.visual_impact_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "VIS publicly visible" ON public.visual_impact_scores
  FOR SELECT TO authenticated USING (true);

-- Create storage bucket for visual portfolio media
INSERT INTO storage.buckets (id, name, public)
VALUES ('visual-portfolio', 'visual-portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for visual portfolio
CREATE POLICY "Users upload own visuals" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'visual-portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public visual access" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'visual-portfolio');
