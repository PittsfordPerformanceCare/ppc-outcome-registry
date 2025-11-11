-- Enable realtime for pending_episodes table
ALTER TABLE public.pending_episodes REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_episodes;