
-- Personal AI Assistant tables (additive only, pai_ prefix)

-- AI user profiles: aggregated understanding of each user
CREATE TABLE public.pai_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  execution_summary JSONB DEFAULT '{}',
  research_domains TEXT[] DEFAULT '{}',
  skill_tags TEXT[] DEFAULT '{}',
  collaboration_preferences JSONB DEFAULT '{}',
  career_goals TEXT,
  ai_personality_notes TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- AI conversations
CREATE TABLE public.pai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  context_type TEXT DEFAULT 'general',
  context_id TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI messages within conversations
CREATE TABLE public.pai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.pai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI recommendations log
CREATE TABLE public.pai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  relevance_score NUMERIC DEFAULT 0,
  source_entity_type TEXT,
  source_entity_id TEXT,
  was_acted_on BOOLEAN DEFAULT false,
  acted_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI insights (skill gaps, performance tips, collaboration opportunities)
CREATE TABLE public.pai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'info',
  action_suggestion TEXT,
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pai_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pai_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY "Users manage own AI profile" ON public.pai_user_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own conversations" ON public.pai_conversations
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users access own messages" ON public.pai_messages
  FOR ALL TO authenticated USING (
    conversation_id IN (SELECT id FROM public.pai_conversations WHERE user_id = auth.uid())
  );

CREATE POLICY "Users access own recommendations" ON public.pai_recommendations
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users access own insights" ON public.pai_insights
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.pai_messages;
