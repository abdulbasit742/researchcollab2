-- Update default currency for wallets table
ALTER TABLE public.wallets 
  ALTER COLUMN currency SET DEFAULT 'PKR';

-- Update default currency for tool_orders table  
ALTER TABLE public.tool_orders
  ALTER COLUMN currency SET DEFAULT 'PKR';

-- Update existing records to PKR
UPDATE public.wallets SET currency = 'PKR' WHERE currency = 'USD';
UPDATE public.tool_orders SET currency = 'PKR' WHERE currency = 'USD';