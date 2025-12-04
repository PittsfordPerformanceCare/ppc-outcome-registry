-- Create UTM health issues table
CREATE TABLE public.utm_health_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  issue_details TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_utm_health_issues_lead_id ON public.utm_health_issues(lead_id);
CREATE INDEX idx_utm_health_issues_issue_type ON public.utm_health_issues(issue_type);
CREATE INDEX idx_utm_health_issues_detected_at ON public.utm_health_issues(detected_at);
CREATE INDEX idx_utm_health_issues_is_active ON public.utm_health_issues(is_active);
CREATE UNIQUE INDEX idx_utm_health_issues_unique_active ON public.utm_health_issues(lead_id, issue_type) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.utm_health_issues ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin/director only
CREATE POLICY "Admins can view UTM health issues"
  ON public.utm_health_issues
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert UTM health issues"
  ON public.utm_health_issues
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update UTM health issues"
  ON public.utm_health_issues
  FOR UPDATE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_utm_health_issues_updated_at
  BEFORE UPDATE ON public.utm_health_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();