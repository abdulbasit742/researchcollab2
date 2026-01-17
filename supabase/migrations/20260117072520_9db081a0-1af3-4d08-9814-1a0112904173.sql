-- Fix overly permissive RLS policies

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert badges" ON public.user_badges;

-- Create more secure notification insert policy (only authenticated users can receive notifications)
CREATE POLICY "Authenticated users can receive notifications" ON public.notifications FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create more secure badges insert policy (only admins can award badges)
CREATE POLICY "Admins can award badges" ON public.user_badges FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));