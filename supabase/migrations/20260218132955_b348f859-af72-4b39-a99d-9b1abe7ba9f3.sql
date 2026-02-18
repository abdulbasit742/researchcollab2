
-- FIX 1: execution_health_snapshots — remove permissive INSERT policy
DROP POLICY IF EXISTS "System can insert health snapshots" ON public.execution_health_snapshots;

-- Replace with admin-only insert
CREATE POLICY "Only admins can insert health snapshots"
ON public.execution_health_snapshots
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- FIX 2: Restrict wallet UPDATE to non-financial fields only
-- Users should NOT be able to modify their own balance/escrow
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;

CREATE POLICY "Users can update their own wallet non-financial fields"
ON public.wallets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Prevent users from changing balance or escrow fields directly
  -- The WITH CHECK ensures the row belongs to the user
  -- Financial mutations must go through RPCs with service_role
);

-- FIX 3: Restrict trust profile UPDATE to prevent self-score modification
-- Users should not modify trust_score, dispute_rate, etc. directly
DROP POLICY IF EXISTS "Users can update their own trust profile" ON public.user_trust_profiles;

CREATE POLICY "Users can update their own trust profile non-score fields"
ON public.user_trust_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- FIX 4: Create a trigger to prevent direct trust_score/balance modification via client
CREATE OR REPLACE FUNCTION public.prevent_financial_self_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the current role is not service_role, block financial field changes
  IF current_setting('role', true) != 'service_role' THEN
    -- For wallets: block balance and escrow changes
    IF TG_TABLE_NAME = 'wallets' THEN
      IF NEW.balance IS DISTINCT FROM OLD.balance 
        OR NEW.escrow_locked IS DISTINCT FROM OLD.escrow_locked
        OR NEW.total_earned IS DISTINCT FROM OLD.total_earned
        OR NEW.total_withdrawn IS DISTINCT FROM OLD.total_withdrawn THEN
        RAISE EXCEPTION 'Financial fields can only be modified by system operations';
      END IF;
    END IF;
    
    -- For trust profiles: block score changes
    IF TG_TABLE_NAME = 'user_trust_profiles' THEN
      IF NEW.trust_score IS DISTINCT FROM OLD.trust_score
        OR NEW.dispute_rate IS DISTINCT FROM OLD.dispute_rate
        OR NEW.successful_rate IS DISTINCT FROM OLD.successful_rate
        OR NEW.total_projects_completed IS DISTINCT FROM OLD.total_projects_completed THEN
        RAISE EXCEPTION 'Trust metrics can only be modified by system operations';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to wallets
DROP TRIGGER IF EXISTS prevent_wallet_self_mutation ON public.wallets;
CREATE TRIGGER prevent_wallet_self_mutation
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.prevent_financial_self_mutation();

-- Apply trigger to trust profiles
DROP TRIGGER IF EXISTS prevent_trust_self_mutation ON public.user_trust_profiles;
CREATE TRIGGER prevent_trust_self_mutation
BEFORE UPDATE ON public.user_trust_profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_financial_self_mutation();
