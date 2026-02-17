
-- Create user_availability table for smart availability & intent broadcasting
CREATE TABLE public.user_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('full_time', 'part_time', 'project_only', 'unavailable', 'available')),
  intent TEXT[] NOT NULL DEFAULT '{}',
  capacity INTEGER NOT NULL DEFAULT 0,
  preferred_budget_min NUMERIC DEFAULT 0,
  preferred_budget_max NUMERIC DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  available_hours_per_week INTEGER DEFAULT 0,
  earliest_start_date DATE DEFAULT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

-- Users can view anyone's availability (it's publicly broadcast)
CREATE POLICY "Anyone can view availability"
ON public.user_availability
FOR SELECT
USING (true);

-- Users can insert their own availability
CREATE POLICY "Users can insert own availability"
ON public.user_availability
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own availability
CREATE POLICY "Users can update own availability"
ON public.user_availability
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own availability
CREATE POLICY "Users can delete own availability"
ON public.user_availability
FOR DELETE
USING (auth.uid() = user_id);
