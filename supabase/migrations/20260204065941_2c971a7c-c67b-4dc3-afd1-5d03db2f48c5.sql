-- Create voice_notes table for storing audio recordings
CREATE TABLE public.voice_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('message', 'deal', 'bio', 'feedback')),
  context_id UUID,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  transcript TEXT,
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ambient_insights table for proactive intelligence nudges
CREATE TABLE public.ambient_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on both tables
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_insights ENABLE ROW LEVEL SECURITY;

-- Voice notes policies - users can only access their own voice notes
CREATE POLICY "Users can view their own voice notes"
  ON public.voice_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice notes"
  ON public.voice_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice notes"
  ON public.voice_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice notes"
  ON public.voice_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Ambient insights policies - users can only access their own insights
CREATE POLICY "Users can view their own insights"
  ON public.ambient_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.ambient_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create insights for users"
  ON public.ambient_insights FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_voice_notes_user_id ON public.voice_notes(user_id);
CREATE INDEX idx_voice_notes_context ON public.voice_notes(context_type, context_id);
CREATE INDEX idx_ambient_insights_user_id ON public.ambient_insights(user_id);
CREATE INDEX idx_ambient_insights_priority ON public.ambient_insights(user_id, priority, is_dismissed);

-- Create storage bucket for voice notes
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice notes bucket
CREATE POLICY "Users can upload their own voice notes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own voice notes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice notes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);