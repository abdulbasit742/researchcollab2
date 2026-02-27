
-- Phase 2A: Real-Time Messaging + Notification Infrastructure (retry without messages realtime)

-- 1. CONVERSATION PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_in_context TEXT NOT NULL DEFAULT 'participant' CHECK (role_in_context IN ('sponsor','executor','admin','institution_admin','mediator','participant','observer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ NULL,
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_thread ON public.conversation_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_participations" ON public.conversation_participants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_read_thread_participants" ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (thread_id IN (
    SELECT thread_id FROM public.conversation_participants WHERE user_id = auth.uid()
  ));

CREATE POLICY "users_insert_participants" ON public.conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    thread_id IN (
      SELECT id FROM public.message_threads WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

-- 2. MESSAGE AUDIT LOG
CREATE TABLE IF NOT EXISTS public.message_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('edit','soft_delete','restore','flag','admin_view')),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  previous_content TEXT NULL,
  new_content TEXT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_msg_audit_message ON public.message_audit_log(message_id);
CREATE INDEX IF NOT EXISTS idx_msg_audit_actor ON public.message_audit_log(actor_id);

ALTER TABLE public.message_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_audit" ON public.message_audit_log
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- Immutability
CREATE OR REPLACE FUNCTION public.prevent_msg_audit_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Message audit log is append-only'; RETURN NULL; END;
$$;

CREATE TRIGGER enforce_msg_audit_no_update
  BEFORE UPDATE ON public.message_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_msg_audit_mutation();

CREATE TRIGGER enforce_msg_audit_no_delete
  BEFORE DELETE ON public.message_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_msg_audit_mutation();

-- 3. send_message_secure RPC
CREATE OR REPLACE FUNCTION public.send_message_secure(
  p_thread_id UUID, p_body TEXT, p_type TEXT DEFAULT 'text', p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_thread RECORD;
  v_msg_id UUID;
  v_trimmed TEXT;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_trimmed := trim(p_body);
  IF v_trimmed = '' THEN RAISE EXCEPTION 'Message body cannot be empty'; END IF;
  IF length(v_trimmed) > 5000 THEN RAISE EXCEPTION 'Message exceeds 5000 character limit'; END IF;

  SELECT * INTO v_thread FROM message_threads WHERE id = p_thread_id;
  IF v_thread IS NULL THEN RAISE EXCEPTION 'Conversation not found'; END IF;

  IF v_thread.user_a != v_uid AND v_thread.user_b != v_uid THEN
    IF NOT EXISTS (SELECT 1 FROM conversation_participants WHERE thread_id = p_thread_id AND user_id = v_uid AND left_at IS NULL) THEN
      RAISE EXCEPTION 'Not a participant in this conversation';
    END IF;
  END IF;

  IF (v_thread.user_a = v_uid AND v_thread.archived_by_user_a = true) OR
     (v_thread.user_b = v_uid AND v_thread.archived_by_user_b = true) THEN
    RAISE EXCEPTION 'Cannot send to archived conversation';
  END IF;

  INSERT INTO messages (thread_id, sender_id, body, type, metadata)
  VALUES (p_thread_id, v_uid, v_trimmed, p_type, p_metadata) RETURNING id INTO v_msg_id;

  UPDATE message_threads SET last_message_at = now(), last_message_text = left(v_trimmed, 100) WHERE id = p_thread_id;

  -- Notify other participants
  IF v_thread.user_a != v_uid THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (v_thread.user_a, 'message', 'New message', left(v_trimmed, 80),
      jsonb_build_object('thread_id', p_thread_id, 'message_id', v_msg_id));
  END IF;
  IF v_thread.user_b != v_uid THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (v_thread.user_b, 'message', 'New message', left(v_trimmed, 80),
      jsonb_build_object('thread_id', p_thread_id, 'message_id', v_msg_id));
  END IF;
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT cp.user_id, 'message', 'New message', left(v_trimmed, 80),
    jsonb_build_object('thread_id', p_thread_id, 'message_id', v_msg_id)
  FROM conversation_participants cp
  WHERE cp.thread_id = p_thread_id AND cp.user_id != v_uid AND cp.left_at IS NULL
    AND cp.user_id != v_thread.user_a AND cp.user_id != v_thread.user_b;

  RETURN jsonb_build_object('message_id', v_msg_id, 'sent_at', now());
END;
$$;

-- 4. send_system_message RPC
CREATE OR REPLACE FUNCTION public.send_system_message(
  p_thread_id UUID, p_body TEXT, p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_msg_id UUID; v_thread RECORD;
BEGIN
  SELECT * INTO v_thread FROM message_threads WHERE id = p_thread_id;
  IF v_thread IS NULL THEN RETURN NULL; END IF;
  INSERT INTO messages (thread_id, sender_id, body, type, metadata)
  VALUES (p_thread_id, v_thread.user_a, p_body, 'system', p_metadata) RETURNING id INTO v_msg_id;
  UPDATE message_threads SET last_message_at = now(), last_message_text = left(p_body, 100) WHERE id = p_thread_id;
  RETURN v_msg_id;
END;
$$;

-- 5. Protect system messages from edit/delete
CREATE OR REPLACE FUNCTION public.prevent_system_message_edit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.type = 'system' AND (NEW.body != OLD.body OR NEW.deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'System messages cannot be edited or deleted';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_system_messages ON public.messages;
CREATE TRIGGER protect_system_messages
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.prevent_system_message_edit();

-- 6. Audit trigger for message edits
CREATE OR REPLACE FUNCTION public.log_message_edit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.body IS DISTINCT FROM NEW.body THEN
    INSERT INTO message_audit_log (message_id, action_type, actor_id, previous_content, new_content)
    VALUES (OLD.id, 'edit', auth.uid(), OLD.body, NEW.body);
  END IF;
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO message_audit_log (message_id, action_type, actor_id, previous_content)
    VALUES (OLD.id, 'soft_delete', auth.uid(), OLD.body);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_message_changes ON public.messages;
CREATE TRIGGER audit_message_changes
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.log_message_edit();

-- 7. Realtime for conversation_participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
