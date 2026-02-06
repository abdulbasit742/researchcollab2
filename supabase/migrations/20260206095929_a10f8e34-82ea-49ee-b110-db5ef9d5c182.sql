-- Add skills column to profiles table for market-balancer edge function
-- (This may already exist, using IF NOT EXISTS pattern)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'skills'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN skills text[] DEFAULT '{}';
    CREATE INDEX idx_profiles_skills ON public.profiles USING GIN(skills);
    COMMENT ON COLUMN public.profiles.skills IS 'User skills for matching. Used by market-balancer and ambient-analyzer edge functions.';
  END IF;
END $$;