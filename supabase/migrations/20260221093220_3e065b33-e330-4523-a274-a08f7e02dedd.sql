
-- Create post_reactions table for LinkedIn-style reactions
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'celebrate', 'support', 'insightful', 'curious')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view reactions" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON public.post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their reactions" ON public.post_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Add repost_of column to posts for quoted reposts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS repost_of UUID REFERENCES public.posts(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS repost_comment TEXT;

-- Index for performance
CREATE INDEX idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX idx_posts_repost_of ON public.posts(repost_of) WHERE repost_of IS NOT NULL;

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
