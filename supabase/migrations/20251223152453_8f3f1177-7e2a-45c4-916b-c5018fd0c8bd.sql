-- Create message_threads table
CREATE TABLE public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair_key text GENERATED ALWAYS AS (
    LEAST(user_a::text, user_b::text) || ':' || GREATEST(user_a::text, user_b::text)
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_message_text text NULL,
  CONSTRAINT unique_pair UNIQUE (pair_key),
  CONSTRAINT different_users CHECK (user_a != user_b)
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz NULL
);

-- Create indexes for performance
CREATE INDEX idx_message_threads_user_a ON public.message_threads(user_a);
CREATE INDEX idx_message_threads_user_b ON public.message_threads(user_b);
CREATE INDEX idx_message_threads_last_message ON public.message_threads(last_message_at DESC);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_unread ON public.messages(thread_id, sender_id) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_threads
CREATE POLICY "Users can view their own threads"
ON public.message_threads
FOR SELECT
USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can create threads they participate in"
ON public.message_threads
FOR INSERT
WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Participants can update thread metadata"
ON public.message_threads
FOR UPDATE
USING (auth.uid() = user_a OR auth.uid() = user_b);

-- RLS policies for messages
CREATE POLICY "Users can view messages in their threads"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = messages.thread_id
    AND (message_threads.user_a = auth.uid() OR message_threads.user_b = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in their threads"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = messages.thread_id
    AND (message_threads.user_a = auth.uid() OR message_threads.user_b = auth.uid())
  )
);

CREATE POLICY "Receivers can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  sender_id != auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = messages.thread_id
    AND (message_threads.user_a = auth.uid() OR message_threads.user_b = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;