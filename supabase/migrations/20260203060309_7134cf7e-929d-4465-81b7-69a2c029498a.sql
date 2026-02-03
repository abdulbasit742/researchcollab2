-- =====================================================
-- PHASE 7: SOCIAL GRAPH, ENDORSEMENTS & GLOBAL SEARCH
-- (Handles existing tables from feed implementation)
-- =====================================================

-- =====================================================
-- PART 1: SOCIAL GRAPH SYSTEM (Additional tables)
-- =====================================================

-- User Connections (Mutual connections - normalized)
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  connection_strength NUMERIC DEFAULT 1.0,
  CONSTRAINT user_connections_ordered CHECK (user_a_id < user_b_id),
  CONSTRAINT user_connections_unique UNIQUE (user_a_id, user_b_id)
);

-- Connection Degrees (Precomputed network distance)
CREATE TABLE IF NOT EXISTS public.connection_degrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  degree INTEGER NOT NULL CHECK (degree BETWEEN 1 AND 3),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT connection_degrees_unique UNIQUE (user_id, target_user_id)
);

-- Network Suggestions (People You May Know)
CREATE TABLE IF NOT EXISTS public.network_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  suggested_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT network_suggestions_unique UNIQUE (user_id, suggested_user_id)
);

-- =====================================================
-- PART 2: SKILL ENDORSEMENTS & RECOMMENDATIONS
-- =====================================================

-- User Skills
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL DEFAULT 'technical',
  proficiency_level TEXT NOT NULL DEFAULT 'intermediate',
  is_featured BOOLEAN DEFAULT false,
  endorsement_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_skills_unique UNIQUE (user_id, skill_name),
  CONSTRAINT skill_category_valid CHECK (skill_category IN ('research', 'technical', 'writing', 'analysis', 'domain', 'soft_skills')),
  CONSTRAINT proficiency_valid CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert'))
);

-- Skill Endorsements
CREATE TABLE IF NOT EXISTS public.skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_skill_id UUID NOT NULL REFERENCES public.user_skills(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endorsement_strength INTEGER DEFAULT 1 CHECK (endorsement_strength BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT skill_endorsements_unique UNIQUE (user_skill_id, endorser_id)
);

-- Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommended_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL DEFAULT 'collaboration',
  context_id UUID,
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'public',
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recommendation_context_valid CHECK (context_type IN ('project', 'organization', 'supervision', 'collaboration', 'general')),
  CONSTRAINT recommendation_visibility_valid CHECK (visibility IN ('public', 'connections', 'private')),
  CONSTRAINT recommendation_status_valid CHECK (status IN ('requested', 'submitted', 'approved', 'hidden'))
);

-- Recommendation Requests
CREATE TABLE IF NOT EXISTS public.recommendation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rec_request_status_valid CHECK (status IN ('pending', 'accepted', 'declined'))
);

-- =====================================================
-- PART 3: GLOBAL SEARCH & DISCOVERY
-- =====================================================

-- Search Index (Denormalized for performance)
CREATE TABLE IF NOT EXISTS public.search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  skills TEXT[],
  university TEXT,
  organization_id UUID,
  trust_score_snapshot INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'public',
  searchable_text TSVECTOR,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT search_index_unique UNIQUE (entity_type, entity_id),
  CONSTRAINT entity_type_valid CHECK (entity_type IN ('user', 'post', 'project', 'publication', 'organization', 'group', 'event', 'tool'))
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profile Views
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Search Events (Analytics)
CREATE TABLE IF NOT EXISTS public.search_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  entity_clicked UUID,
  entity_type_clicked TEXT,
  filters JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_connections_a ON public.user_connections(user_a_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_b ON public.user_connections(user_b_id);
CREATE INDEX IF NOT EXISTS idx_connection_degrees_user ON public.connection_degrees(user_id);
CREATE INDEX IF NOT EXISTS idx_network_suggestions_user ON public.network_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill ON public.skill_endorsements(user_skill_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON public.recommendations(recommended_user_id);
CREATE INDEX IF NOT EXISTS idx_search_index_text ON public.search_index USING GIN(searchable_text);
CREATE INDEX IF NOT EXISTS idx_search_index_type ON public.search_index(entity_type);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON public.profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_date ON public.profile_views(created_at);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_events ENABLE ROW LEVEL SECURITY;

-- User Connections RLS
CREATE POLICY "Anyone can view connections" ON public.user_connections FOR SELECT USING (true);
CREATE POLICY "Admins can manage connections" ON public.user_connections FOR ALL USING (is_admin(auth.uid()));

-- Connection Degrees RLS
CREATE POLICY "Users can view own degrees" ON public.connection_degrees FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Network Suggestions RLS
CREATE POLICY "Users can view own suggestions" ON public.network_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can dismiss suggestions" ON public.network_suggestions FOR UPDATE USING (auth.uid() = user_id);

-- User Skills RLS
CREATE POLICY "Anyone can view skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON public.user_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON public.user_skills FOR DELETE USING (auth.uid() = user_id);

-- Skill Endorsements RLS
CREATE POLICY "Anyone can view endorsements" ON public.skill_endorsements FOR SELECT USING (true);
CREATE POLICY "Users can endorse skills" ON public.skill_endorsements FOR INSERT WITH CHECK (
  auth.uid() = endorser_id 
  AND endorser_id != (SELECT user_id FROM public.user_skills WHERE id = user_skill_id)
);
CREATE POLICY "Users can remove endorsements" ON public.skill_endorsements FOR DELETE USING (auth.uid() = endorser_id OR is_admin(auth.uid()));

-- Recommendations RLS
CREATE POLICY "Public recommendations visible" ON public.recommendations FOR SELECT USING (
  visibility = 'public' 
  OR auth.uid() = recommender_id 
  OR auth.uid() = recommended_user_id
  OR is_admin(auth.uid())
);
CREATE POLICY "Users can write recommendations" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = recommender_id);
CREATE POLICY "Users can update own recommendations" ON public.recommendations FOR UPDATE USING (
  auth.uid() = recommender_id OR auth.uid() = recommended_user_id
);

-- Recommendation Requests RLS
CREATE POLICY "Users can view own requests" ON public.recommendation_requests FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = target_user_id
);
CREATE POLICY "Users can create requests" ON public.recommendation_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can respond to requests" ON public.recommendation_requests FOR UPDATE USING (auth.uid() = target_user_id);

-- Search Index RLS
CREATE POLICY "Anyone can search public content" ON public.search_index FOR SELECT USING (visibility = 'public' OR is_admin(auth.uid()));
CREATE POLICY "Admins can manage index" ON public.search_index FOR ALL USING (is_admin(auth.uid()));

-- Saved Searches RLS
CREATE POLICY "Users can manage own searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);

-- Profile Views RLS
CREATE POLICY "Users can see who viewed them" ON public.profile_views FOR SELECT USING (auth.uid() = viewed_user_id OR is_admin(auth.uid()));
CREATE POLICY "Anyone can record views" ON public.profile_views FOR INSERT WITH CHECK (true);

-- Search Events RLS
CREATE POLICY "Users can log searches" ON public.search_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON public.search_events FOR SELECT USING (is_admin(auth.uid()));

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update endorsement count
CREATE OR REPLACE FUNCTION public.update_endorsement_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_skills SET endorsement_count = endorsement_count + 1 WHERE id = NEW.user_skill_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_skills SET endorsement_count = GREATEST(endorsement_count - 1, 0) WHERE id = OLD.user_skill_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS update_skill_endorsement_count ON public.skill_endorsements;
CREATE TRIGGER update_skill_endorsement_count
AFTER INSERT OR DELETE ON public.skill_endorsements
FOR EACH ROW EXECUTE FUNCTION public.update_endorsement_count();

-- Function to create connection from accepted request
CREATE OR REPLACE FUNCTION public.create_connection_from_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_a UUID;
  v_user_b UUID;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Normalize order
    IF NEW.requester_id < NEW.recipient_id THEN
      v_user_a := NEW.requester_id;
      v_user_b := NEW.recipient_id;
    ELSE
      v_user_a := NEW.recipient_id;
      v_user_b := NEW.requester_id;
    END IF;
    
    -- Create connection
    INSERT INTO user_connections (user_a_id, user_b_id)
    VALUES (v_user_a, v_user_b)
    ON CONFLICT DO NOTHING;
    
    -- Auto-follow each other
    INSERT INTO user_follows (follower_id, following_id)
    VALUES (NEW.requester_id, NEW.recipient_id), (NEW.recipient_id, NEW.requester_id)
    ON CONFLICT DO NOTHING;
    
    -- Record degree 1 connection
    INSERT INTO connection_degrees (user_id, target_user_id, degree)
    VALUES (NEW.requester_id, NEW.recipient_id, 1), (NEW.recipient_id, NEW.requester_id, 1)
    ON CONFLICT (user_id, target_user_id) DO UPDATE SET degree = 1, computed_at = now();
    
    -- Notify requester
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.requester_id, 'connection_accepted', 'Connection Accepted',
      'Your connection request was accepted!',
      jsonb_build_object('user_id', NEW.recipient_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_connection_request_accepted ON public.connection_requests;
CREATE TRIGGER on_connection_request_accepted
AFTER UPDATE ON public.connection_requests
FOR EACH ROW EXECUTE FUNCTION public.create_connection_from_request();

-- Function to update search index for profiles
CREATE OR REPLACE FUNCTION public.update_profile_search_index()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO search_index (entity_type, entity_id, title, description, university, trust_score_snapshot, searchable_text)
  VALUES (
    'user',
    NEW.id,
    COALESCE(NEW.full_name, COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')),
    NEW.bio,
    NEW.university,
    0,
    to_tsvector('english', COALESCE(NEW.full_name, '') || ' ' || COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '') || ' ' || COALESCE(NEW.bio, '') || ' ' || COALESCE(NEW.university, ''))
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    university = EXCLUDED.university,
    searchable_text = EXCLUDED.searchable_text,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_to_search ON public.profiles;
CREATE TRIGGER sync_profile_to_search
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_profile_search_index();

-- Function to get mutual connections count
CREATE OR REPLACE FUNCTION public.get_mutual_connections_count(user_a UUID, user_b UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM (
    SELECT CASE WHEN user_a_id = user_a THEN user_b_id ELSE user_a_id END AS connection_id
    FROM user_connections
    WHERE user_a_id = user_a OR user_b_id = user_a
  ) a
  INNER JOIN (
    SELECT CASE WHEN user_a_id = user_b THEN user_b_id ELSE user_a_id END AS connection_id
    FROM user_connections
    WHERE user_a_id = user_b OR user_b_id = user_b
  ) b ON a.connection_id = b.connection_id
$$;

-- Function to get connection degree
CREATE OR REPLACE FUNCTION public.get_connection_degree(source_user UUID, target_user UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT degree FROM connection_degrees WHERE user_id = source_user AND target_user_id = target_user),
    0
  )
$$;