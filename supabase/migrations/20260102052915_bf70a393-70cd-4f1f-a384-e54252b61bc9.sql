-- Create portfolio_projects table
CREATE TABLE public.portfolio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view portfolio projects (public profiles)
CREATE POLICY "Anyone can view portfolio projects"
ON public.portfolio_projects
FOR SELECT
USING (true);

-- Users can create their own portfolio projects
CREATE POLICY "Users can create their own portfolio projects"
ON public.portfolio_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolio projects
CREATE POLICY "Users can update their own portfolio projects"
ON public.portfolio_projects
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own portfolio projects
CREATE POLICY "Users can delete their own portfolio projects"
ON public.portfolio_projects
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user lookups
CREATE INDEX idx_portfolio_projects_user_id ON public.portfolio_projects(user_id);
CREATE INDEX idx_portfolio_projects_display_order ON public.portfolio_projects(user_id, display_order);