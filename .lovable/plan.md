

# Fix: Enable RLS on `policy_acceptances` Table

## Problem

The `policy_acceptances` table is the **only** table in the public schema without Row Level Security enabled. This means anyone with the anon key can read, insert, update, or delete policy acceptance records for any user -- a direct data exposure and tampering risk.

## Solution

Enable RLS and add two simple policies:

1. **SELECT**: Users can only read their own policy acceptances.
2. **INSERT**: Users can only insert records where `user_id` matches their own auth ID.

No UPDATE or DELETE policies are needed -- policy acceptances should be immutable (once accepted, the record stays).

Admins can also read all records for compliance auditing.

## Technical Details

A single database migration with:

```text
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
```

No frontend code changes required.

