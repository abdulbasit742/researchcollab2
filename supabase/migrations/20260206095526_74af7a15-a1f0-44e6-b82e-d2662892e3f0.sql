-- Add required_skills column to offers table for market-balancer edge function
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS required_skills text[] DEFAULT '{}';

-- Add index for skill-based matching
CREATE INDEX IF NOT EXISTS idx_offers_required_skills ON public.offers USING GIN(required_skills);

-- Add comment documenting the contract
COMMENT ON COLUMN public.offers.required_skills IS 'Skills required for this opportunity. Used by market-balancer edge function for supply/demand analysis.';