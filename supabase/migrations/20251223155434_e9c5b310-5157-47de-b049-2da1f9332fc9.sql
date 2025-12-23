-- Add reactions column to messages (jsonb array of {user_id, emoji})
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '[]'::jsonb;

-- Add deleted_at for soft delete
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Add starred columns to message_threads
ALTER TABLE public.message_threads
ADD COLUMN IF NOT EXISTS starred_by_user_a boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS starred_by_user_b boolean DEFAULT false;

-- Create pinned_messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  pinned_by uuid NOT NULL,
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, pinned_by)
);

-- Create thread_notes table for private notes
CREATE TABLE IF NOT EXISTS public.thread_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(thread_id, user_id)
);

-- Enable RLS
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_notes ENABLE ROW LEVEL SECURITY;

-- RLS for pinned_messages
CREATE POLICY "Users can view pins in their threads"
ON public.pinned_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = pinned_messages.thread_id
    AND (message_threads.user_a = auth.uid() OR message_threads.user_b = auth.uid())
  )
);

CREATE POLICY "Users can pin messages in their threads"
ON public.pinned_messages FOR INSERT
WITH CHECK (
  pinned_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = pinned_messages.thread_id
    AND (message_threads.user_a = auth.uid() OR message_threads.user_b = auth.uid())
  )
);

CREATE POLICY "Users can unpin their own pins"
ON public.pinned_messages FOR DELETE
USING (pinned_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- RLS for thread_notes
CREATE POLICY "Users can view their own notes"
ON public.thread_notes FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notes"
ON public.thread_notes FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notes"
ON public.thread_notes FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes"
ON public.thread_notes FOR DELETE
USING (user_id = auth.uid());

-- Update messages RLS to hide deleted content (modify existing SELECT policy)
DROP POLICY IF EXISTS "Users and admins can view messages" ON public.messages;
CREATE POLICY "Users and admins can view messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = messages.thread_id
    AND (message_threads.user_a = auth.uid() OR message_threads.user_b = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Allow senders to soft-delete their messages
CREATE POLICY "Senders can soft delete their messages"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Allow participants to add reactions
DROP POLICY IF EXISTS "Receivers can mark messages as read" ON public.messages;
CREATE POLICY "Participants can update message metadata"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = messages.thread_id
    AND (message_threads.user_a = auth.uid() OR message_threads.user_b = auth.uid())
  )
);