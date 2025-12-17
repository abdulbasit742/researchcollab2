-- Create earning_projects table
CREATE TABLE public.earning_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  tags text[],
  budget_min numeric,
  budget_max numeric,
  deadline_days int,
  location text DEFAULT 'Remote',
  status text DEFAULT 'open',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create earning_bids table
CREATE TABLE public.earning_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.earning_projects(id) ON DELETE CASCADE NOT NULL,
  bidder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  delivery_days int NOT NULL,
  message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.earning_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_bids ENABLE ROW LEVEL SECURITY;

-- RLS for earning_projects
CREATE POLICY "Anyone can view open projects"
ON public.earning_projects
FOR SELECT
USING (status = 'open' OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can create projects"
ON public.earning_projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their projects"
ON public.earning_projects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their projects"
ON public.earning_projects
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- RLS for earning_bids
CREATE POLICY "Bidders can view their own bids"
ON public.earning_bids
FOR SELECT
TO authenticated
USING (bidder_id = auth.uid());

CREATE POLICY "Project owners can view bids on their projects"
ON public.earning_bids
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.earning_projects
    WHERE id = project_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can place bids"
ON public.earning_bids
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Bidders can update their own bids"
ON public.earning_bids
FOR UPDATE
TO authenticated
USING (bidder_id = auth.uid());

CREATE POLICY "Bidders can delete their own bids"
ON public.earning_bids
FOR DELETE
TO authenticated
USING (bidder_id = auth.uid());