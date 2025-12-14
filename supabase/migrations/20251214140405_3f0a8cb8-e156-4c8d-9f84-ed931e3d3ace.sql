-- Create table to track which episodes are shared with verified professionals
CREATE TABLE public.professional_shared_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id TEXT NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_level TEXT NOT NULL DEFAULT 'read_only',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_user_id, episode_id)
);

-- Enable Row Level Security
ALTER TABLE public.professional_shared_episodes ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own shared episodes
CREATE POLICY "Professionals can view their shared episodes"
ON public.professional_shared_episodes
FOR SELECT
USING (
  auth.uid() = professional_user_id
  AND (expires_at IS NULL OR expires_at > now())
);

-- Clinicians and admins can manage shared episodes
CREATE POLICY "Clinicians can manage shared episodes"
ON public.professional_shared_episodes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'clinician', 'owner')
  )
);

-- Create index for efficient lookups
CREATE INDEX idx_professional_shared_episodes_professional 
ON public.professional_shared_episodes(professional_user_id);

CREATE INDEX idx_professional_shared_episodes_episode 
ON public.professional_shared_episodes(episode_id);

-- Add trigger for updated_at
CREATE TRIGGER update_professional_shared_episodes_updated_at
  BEFORE UPDATE ON public.professional_shared_episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();