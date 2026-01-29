-- Enable realtime for earning_projects and earning_bids tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.earning_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.earning_bids;