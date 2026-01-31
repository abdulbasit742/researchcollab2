-- First drop the existing problematic policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create a security definer function that can check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'::app_role
  )
$$;

-- Now create the policy using the SECURITY DEFINER function (bypasses RLS)
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));