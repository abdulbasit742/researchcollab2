
-- Update check constraint to allow new plan names
ALTER TABLE public.subscription_tiers DROP CONSTRAINT subscription_tiers_name_check;
ALTER TABLE public.subscription_tiers ADD CONSTRAINT subscription_tiers_name_check CHECK (name = ANY (ARRAY['Basic'::text, 'Career'::text, 'Business'::text, 'Free'::text, 'Pro'::text, 'Elite'::text]));
