-- Extend messages table with type and attachment columns
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'text',
ADD COLUMN IF NOT EXISTS attachment jsonb NULL,
ADD COLUMN IF NOT EXISTS metadata jsonb NULL;

-- Create connection_requests table
CREATE TABLE public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_connection_request UNIQUE (requester_id, recipient_id),
  CONSTRAINT different_users_connection CHECK (requester_id != recipient_id)
);

-- Create offers table
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_type text NOT NULL CHECK (offer_type IN ('tool_subscription', 'fyp_service', 'research_task', 'tutoring', 'other')),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'PKR',
  delivery_days integer,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create offer_attachments table
CREATE TABLE public.offer_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  url text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_connection_requests_requester ON public.connection_requests(requester_id);
CREATE INDEX idx_connection_requests_recipient ON public.connection_requests(recipient_id);
CREATE INDEX idx_connection_requests_status ON public.connection_requests(status);
CREATE INDEX idx_offers_thread ON public.offers(thread_id);
CREATE INDEX idx_offers_sender ON public.offers(sender_id);
CREATE INDEX idx_offers_recipient ON public.offers(recipient_id);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_messages_type ON public.messages(type);

-- Enable RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_attachments ENABLE ROW LEVEL SECURITY;

-- RLS for connection_requests
CREATE POLICY "Users can view their connection requests"
ON public.connection_requests FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create connection requests"
ON public.connection_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients can update connection request status"
ON public.connection_requests FOR UPDATE
USING (auth.uid() = recipient_id);

-- RLS for offers
CREATE POLICY "Participants can view offers"
ON public.offers FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Senders can create offers"
ON public.offers FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Participants can update offer status"
ON public.offers FOR UPDATE
USING (
  (auth.uid() = recipient_id AND status = 'sent') OR 
  (auth.uid() = sender_id AND status = 'sent')
);

-- RLS for offer_attachments
CREATE POLICY "Offer participants can view attachments"
ON public.offer_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.offers
    WHERE offers.id = offer_attachments.offer_id
    AND (offers.sender_id = auth.uid() OR offers.recipient_id = auth.uid())
  )
);

CREATE POLICY "Offer senders can add attachments"
ON public.offer_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.offers
    WHERE offers.id = offer_attachments.offer_id
    AND offers.sender_id = auth.uid()
  )
);

-- Update message_threads RLS to allow admin access for support
DROP POLICY IF EXISTS "Users can view their own threads" ON public.message_threads;
CREATE POLICY "Users and admins can view threads"
ON public.message_threads FOR SELECT
USING (
  auth.uid() = user_a OR 
  auth.uid() = user_b OR 
  public.has_role(auth.uid(), 'admin')
);

-- Update messages RLS to allow admin access
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.messages;
CREATE POLICY "Users and admins can view messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = messages.thread_id
    AND (
      message_threads.user_a = auth.uid() OR 
      message_threads.user_b = auth.uid() OR
      public.has_role(auth.uid(), 'admin')
    )
  )
);

-- Allow admins to insert messages in any thread
DROP POLICY IF EXISTS "Users can insert messages in their threads" ON public.messages;
CREATE POLICY "Users and admins can insert messages"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.message_threads
    WHERE message_threads.id = messages.thread_id
    AND (
      message_threads.user_a = auth.uid() OR 
      message_threads.user_b = auth.uid() OR
      public.has_role(auth.uid(), 'admin')
    )
  )
);

-- Create chat_attachments storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_attachments', 'chat_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for chat_attachments
CREATE POLICY "Thread participants can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat_attachments' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Thread participants can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat_attachments' AND
  auth.uid() IS NOT NULL
);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;