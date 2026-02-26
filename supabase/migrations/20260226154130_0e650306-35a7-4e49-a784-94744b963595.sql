
-- Enable realtime on online_presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_presence;

-- Fix the overly permissive policy - replace with scoped policy
DROP POLICY IF EXISTS "Users can manage own presence" ON public.online_presence;

CREATE POLICY "Users can insert own presence"
  ON public.online_presence FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own presence"
  ON public.online_presence FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own presence"
  ON public.online_presence FOR DELETE TO authenticated
  USING (user_id = auth.uid());
