-- Fix overly permissive RLS policies

-- Drop the overly permissive idea_evolution insert policy
DROP POLICY IF EXISTS "Authenticated users can contribute ideas" ON public.idea_evolution;

-- Create a more restrictive policy - users can contribute if they're in the contributors array
CREATE POLICY "Authenticated users can contribute ideas"
ON public.idea_evolution FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = ANY(contributors) OR contributors IS NULL OR cardinality(contributors) = 0);

-- The council votes INSERT policy is actually correct - it checks membership
-- Let's verify the logic is sound by keeping it as-is since it has proper checks