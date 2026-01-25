-- Add admin RLS policies for tool_orders
CREATE POLICY "Admins can view all orders" 
ON public.tool_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders" 
ON public.tool_orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Add admin RLS policies for tool_subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.tool_subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all subscriptions" 
ON public.tool_subscriptions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Add delivery_details column to tool_orders if not exists
ALTER TABLE public.tool_orders 
ADD COLUMN IF NOT EXISTS delivery_details JSONB DEFAULT NULL;

-- Add plan_id and plan_name columns for fulfillment tracking
ALTER TABLE public.tool_orders 
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT NULL;

ALTER TABLE public.tool_orders 
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT NULL;

ALTER TABLE public.tool_orders 
ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT 1;

-- Add more subscription details
ALTER TABLE public.tool_subscriptions 
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT NULL;

ALTER TABLE public.tool_subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;

-- Create support_tickets table for subscription support
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.tool_subscriptions(id),
  tool_id UUID REFERENCES public.tools(id),
  problem_type TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_reply TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Support tickets RLS policies
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" 
ON public.support_tickets 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));