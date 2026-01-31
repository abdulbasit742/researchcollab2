-- Drop the redundant and recursive policies on user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create a non-recursive admin policy using a direct subquery without calling has_role
-- This avoids recursion by not using the has_role function which queries user_roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'admin'::app_role
  )
);