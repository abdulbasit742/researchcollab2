-- Add archive and mute columns to message_threads
ALTER TABLE public.message_threads 
ADD COLUMN IF NOT EXISTS archived_by_user_a boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_by_user_b boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS muted_by_user_a_until timestamptz NULL,
ADD COLUMN IF NOT EXISTS muted_by_user_b_until timestamptz NULL;

-- Create user_blocks table for blocking functionality
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (blocker_id, blocked_id)
);

-- Enable RLS on user_blocks
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS for user_blocks: users can view their own blocks
CREATE POLICY "Users can view their blocks"
ON public.user_blocks FOR SELECT
USING (auth.uid() = blocker_id);

-- RLS for user_blocks: users can create blocks
CREATE POLICY "Users can block others"
ON public.user_blocks FOR INSERT
WITH CHECK (auth.uid() = blocker_id AND blocker_id != blocked_id);

-- RLS for user_blocks: users can unblock
CREATE POLICY "Users can unblock"
ON public.user_blocks FOR DELETE
USING (auth.uid() = blocker_id);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  thread_id uuid REFERENCES public.message_threads(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'harassment', 'fake', 'offensive', 'other')),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS for reports: users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id);

-- RLS for reports: users can create reports
CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id AND reporter_id != reported_user_id);

-- RLS for reports: admins can view all reports
CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS for reports: admins can update reports
CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create function to check if users are blocked
CREATE OR REPLACE FUNCTION public.is_blocked(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  )
$$;

-- Update messages INSERT policy to prevent blocked users from messaging
DROP POLICY IF EXISTS "Users and admins can insert messages" ON public.messages;

CREATE POLICY "Users can insert messages if not blocked"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM message_threads
    WHERE id = messages.thread_id
    AND (
      (user_a = auth.uid() OR user_b = auth.uid())
      OR has_role(auth.uid(), 'admin')
    )
    AND NOT is_blocked(user_a, user_b)
  )
);