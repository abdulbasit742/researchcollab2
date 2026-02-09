
-- Drop the overly permissive SELECT policy
DROP POLICY "Anyone can view trust profiles" ON public.user_trust_profiles;

-- Create restricted SELECT policy: only owner or admin
CREATE POLICY "Users can view their own trust profile"
ON public.user_trust_profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.is_admin(auth.uid())
);
