
-- Enable RLS
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;

-- Users can view their own acceptances
CREATE POLICY "Users can view own policy acceptances"
ON public.policy_acceptances FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all acceptances
CREATE POLICY "Admins can view all policy acceptances"
ON public.policy_acceptances FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Users can insert their own acceptances
CREATE POLICY "Users can insert own policy acceptances"
ON public.policy_acceptances FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
