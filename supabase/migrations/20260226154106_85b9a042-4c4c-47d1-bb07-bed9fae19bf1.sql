
-- Create online_presence table
CREATE TABLE IF NOT EXISTS public.online_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.online_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read presence"
  ON public.online_presence FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own presence"
  ON public.online_presence FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
