-- Add new fields to profiles table for onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student',
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS research_level text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS university text,
ADD COLUMN IF NOT EXISTS interests text[],
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create or replace the updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();