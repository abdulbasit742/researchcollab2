
-- Fix trust profiles public exposure: restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view trust profiles" ON public.user_trust_profiles;
CREATE POLICY "Authenticated users view trust profiles"
  ON public.user_trust_profiles FOR SELECT TO authenticated
  USING (true);

-- Fix contact_submissions: tighten the remaining permissive INSERT policy
-- Add basic constraints instead of WITH CHECK(true)
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Public can submit contact form with constraints"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (
    -- Ensure required fields are non-null
    name IS NOT NULL AND
    email IS NOT NULL AND
    message IS NOT NULL AND
    -- Prevent injection of admin-only fields
    status = 'new'
  );
