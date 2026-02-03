-- =============================================
-- ACTIVITY FEED & SOCIAL POSTING SYSTEM
-- Phase 6.5: Core Social Layer
-- =============================================

-- Create post type enum
CREATE TYPE post_type AS ENUM ('text', 'research_update', 'announcement', 'publication', 'organization_post', 'milestone', 'collaboration_request');

-- Create post visibility enum
CREATE TYPE post_visibility AS ENUM ('public', 'connections', 'followers', 'organization', 'private');

-- Create feed event type enum
CREATE TYPE feed_event_type AS ENUM (
  'new_connection', 'new_publication', 'project_completed', 'verification_approved',
  'organization_joined', 'badge_earned', 'milestone_reached', 'collaboration_started',
  'tool_purchased', 'review_received', 'profile_updated'
);

-- Create report reason enum
CREATE TYPE report_reason AS ENUM (
  'spam', 'harassment', 'misinformation', 'inappropriate_content', 
  'copyright_violation', 'off_topic', 'other'
);

-- =============================================
-- 1. POSTS TABLE
-- =============================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type post_type NOT NULL DEFAULT 'text',
  visibility post_visibility NOT NULL DEFAULT 'public',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  
  -- Engagement counters (denormalized for performance)
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  media_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  mentioned_users UUID[] DEFAULT '{}',
  linked_entity_type TEXT,
  linked_entity_id UUID,
  
  -- Moderation
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  hidden_reason TEXT,
  hidden_by UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for posts
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_posts_organization_id ON public.posts(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_posts_post_type ON public.posts(post_type);
CREATE INDEX idx_posts_is_hidden ON public.posts(is_hidden) WHERE is_hidden = false;

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. POST LIKES TABLE
-- =============================================
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- Indexes
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. POST COMMENTS TABLE
-- =============================================
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX idx_post_comments_parent ON public.post_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. COMMENT LIKES TABLE
-- =============================================
CREATE TABLE public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. POST SHARES TABLE
-- =============================================
CREATE TABLE public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_comment TEXT,
  visibility post_visibility NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX idx_post_shares_user_id ON public.post_shares(user_id);
CREATE INDEX idx_post_shares_created_at ON public.post_shares(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. FEED EVENTS TABLE (System-generated activity)
-- =============================================
CREATE TABLE public.feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type feed_event_type NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  visibility post_visibility NOT NULL DEFAULT 'public',
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_feed_events_actor_id ON public.feed_events(actor_id);
CREATE INDEX idx_feed_events_created_at ON public.feed_events(created_at DESC);
CREATE INDEX idx_feed_events_event_type ON public.feed_events(event_type);
CREATE INDEX idx_feed_events_entity ON public.feed_events(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.feed_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. REPORTED POSTS TABLE
-- =============================================
CREATE TABLE public.reported_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT report_target_check CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_reported_posts_status ON public.reported_posts(status);
CREATE INDEX idx_reported_posts_post_id ON public.reported_posts(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_reported_posts_created_at ON public.reported_posts(created_at DESC);

-- Enable RLS
ALTER TABLE public.reported_posts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. USER FOLLOWS TABLE (for feed visibility)
-- =============================================
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Indexes
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. POST BOOKMARKS TABLE
-- =============================================
CREATE TABLE public.post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_bookmark UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_bookmarks_user ON public.post_bookmarks(user_id);

-- Enable RLS
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Helper function to check if users are connected
CREATE OR REPLACE FUNCTION public.are_connected(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connection_requests
    WHERE status = 'accepted'
    AND ((requester_id = user_a AND recipient_id = user_b)
      OR (requester_id = user_b AND recipient_id = user_a))
  )
$$;

-- Helper function to check if user follows another
CREATE OR REPLACE FUNCTION public.is_following(follower UUID, following UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_follows
    WHERE follower_id = follower AND following_id = following
  )
$$;

-- Helper function to check if user is shadow banned
CREATE OR REPLACE FUNCTION public.is_shadow_banned(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_restrictions
    WHERE user_id = check_user_id
    AND restriction_type = 'shadow_ban'
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Helper function to check post visibility
CREATE OR REPLACE FUNCTION public.can_view_post(post_row posts, viewer_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hidden posts only visible to admins
  IF post_row.is_hidden AND NOT is_admin(viewer_id) THEN
    RETURN false;
  END IF;
  
  -- Check if blocked
  IF is_blocked(post_row.author_id, viewer_id) THEN
    RETURN false;
  END IF;
  
  -- Shadow banned users' posts not visible to others
  IF post_row.author_id != viewer_id AND is_shadow_banned(post_row.author_id) THEN
    RETURN false;
  END IF;
  
  -- Author can always see own posts
  IF post_row.author_id = viewer_id THEN
    RETURN true;
  END IF;
  
  -- Admins can see all
  IF is_admin(viewer_id) THEN
    RETURN true;
  END IF;
  
  -- Check visibility rules
  CASE post_row.visibility
    WHEN 'public' THEN
      RETURN true;
    WHEN 'connections' THEN
      RETURN are_connected(post_row.author_id, viewer_id);
    WHEN 'followers' THEN
      RETURN is_following(viewer_id, post_row.author_id);
    WHEN 'organization' THEN
      RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = post_row.organization_id
        AND user_id = viewer_id
      );
    WHEN 'private' THEN
      RETURN false;
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- POSTS POLICIES
CREATE POLICY "Users can view posts based on visibility"
  ON public.posts FOR SELECT
  TO authenticated
  USING (can_view_post(posts, auth.uid()));

CREATE POLICY "Users can create own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- POST LIKES POLICIES
CREATE POLICY "Users can view likes on visible posts"
  ON public.post_likes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id AND can_view_post(p, auth.uid())
    )
  );

CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- POST COMMENTS POLICIES
CREATE POLICY "Users can view comments on visible posts"
  ON public.post_comments FOR SELECT
  TO authenticated
  USING (
    is_hidden = false AND
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id AND can_view_post(p, auth.uid())
    )
  );

CREATE POLICY "Users can create comments"
  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON public.post_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- COMMENT LIKES POLICIES
CREATE POLICY "Users can view comment likes"
  ON public.comment_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- POST SHARES POLICIES
CREATE POLICY "Users can view shares"
  ON public.post_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can share posts"
  ON public.post_shares FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own shares"
  ON public.post_shares FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- FEED EVENTS POLICIES
CREATE POLICY "Users can view feed events based on visibility"
  ON public.feed_events FOR SELECT
  TO authenticated
  USING (
    is_hidden = false AND
    NOT is_blocked(actor_id, auth.uid()) AND
    NOT is_shadow_banned(actor_id) AND
    (
      visibility = 'public' OR
      actor_id = auth.uid() OR
      (visibility = 'connections' AND are_connected(actor_id, auth.uid())) OR
      (visibility = 'followers' AND is_following(auth.uid(), actor_id)) OR
      is_admin(auth.uid())
    )
  );

CREATE POLICY "System can create feed events"
  ON public.feed_events FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- REPORTED POSTS POLICIES
CREATE POLICY "Users can report posts"
  ON public.reported_posts FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON public.reported_posts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()) OR reporter_id = auth.uid());

CREATE POLICY "Admins can update reports"
  ON public.reported_posts FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- USER FOLLOWS POLICIES
CREATE POLICY "Users can view follows"
  ON public.user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());

-- POST BOOKMARKS POLICIES
CREATE POLICY "Users can view own bookmarks"
  ON public.post_bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can bookmark posts"
  ON public.post_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove bookmarks"
  ON public.post_bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- TRIGGERS FOR COUNTER UPDATES
-- =============================================

-- Function to update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_post_likes
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update post comments count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_post_comments
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Function to update post shares count
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_post_shares
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_comment_likes
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- =============================================
-- NOTIFICATION TRIGGERS
-- =============================================

-- Function to create notification on like
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post posts%ROWTYPE;
  v_liker_name TEXT;
BEGIN
  SELECT * INTO v_post FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if liking own post
  IF v_post.author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  SELECT full_name INTO v_liker_name FROM profiles WHERE id = NEW.user_id;
  
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_post.author_id,
    'post_liked',
    'New Like on Your Post',
    v_liker_name || ' liked your post',
    jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_post_like
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION notify_post_like();

-- Function to create notification on comment
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post posts%ROWTYPE;
  v_commenter_name TEXT;
BEGIN
  SELECT * INTO v_post FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if commenting on own post
  IF v_post.author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  SELECT full_name INTO v_commenter_name FROM profiles WHERE id = NEW.user_id;
  
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_post.author_id,
    'post_commented',
    'New Comment on Your Post',
    v_commenter_name || ' commented on your post',
    jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_post_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION notify_post_comment();

-- Function to create notification on share
CREATE OR REPLACE FUNCTION public.notify_post_share()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post posts%ROWTYPE;
  v_sharer_name TEXT;
BEGIN
  SELECT * INTO v_post FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if sharing own post
  IF v_post.author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  SELECT full_name INTO v_sharer_name FROM profiles WHERE id = NEW.user_id;
  
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_post.author_id,
    'post_shared',
    'Your Post Was Shared',
    v_sharer_name || ' shared your post',
    jsonb_build_object('post_id', NEW.post_id, 'share_id', NEW.id, 'sharer_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_post_share
AFTER INSERT ON public.post_shares
FOR EACH ROW EXECUTE FUNCTION notify_post_share();

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;