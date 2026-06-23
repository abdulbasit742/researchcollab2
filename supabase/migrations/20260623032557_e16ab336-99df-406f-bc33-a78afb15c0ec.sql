
CREATE TABLE public.research_gap_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  context TEXT,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_gap_searches TO authenticated;
GRANT ALL ON public.research_gap_searches TO service_role;
ALTER TABLE public.research_gap_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gap searches" ON public.research_gap_searches FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_gap_searches_user ON public.research_gap_searches(user_id, created_at DESC);
