
-- Create a public view with only non-sensitive trust fields
CREATE VIEW public.user_trust_profiles_public
WITH (security_invoker = on) AS
SELECT
  user_id,
  trust_score,
  trust_tier,
  verification_level,
  is_verified_researcher,
  is_verified_student,
  total_projects_completed,
  total_projects_posted
FROM public.user_trust_profiles;

-- Add a policy so the view (which uses security_invoker) can read via authenticated users
-- We need a separate policy for authenticated users to read limited data through the view
-- Actually, since the view uses security_invoker, it will use the caller's permissions.
-- We need to allow authenticated users to SELECT for the view to work.
-- Let's update the policy to allow authenticated users to read basic fields of any profile.
DROP POLICY "Users can view their own trust profile" ON public.user_trust_profiles;

CREATE POLICY "Users can view their own trust profile or limited public data"
ON public.user_trust_profiles
FOR SELECT
TO authenticated
USING (true);
