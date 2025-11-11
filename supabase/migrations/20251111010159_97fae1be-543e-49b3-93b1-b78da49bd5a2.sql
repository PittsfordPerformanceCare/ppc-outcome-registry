-- Create custom email templates table
CREATE TABLE public.custom_email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('professional', 'friendly', 'modern', 'minimal')),
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for custom templates
CREATE POLICY "Users can view their clinic's templates"
ON public.custom_email_templates
FOR SELECT
USING (clinic_id IN (
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can create templates"
ON public.custom_email_templates
FOR INSERT
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  )
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update their clinic's templates"
ON public.custom_email_templates
FOR UPDATE
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  )
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can delete their clinic's templates"
ON public.custom_email_templates
FOR DELETE
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  )
  AND is_admin(auth.uid())
);

-- Create updated_at trigger
CREATE TRIGGER update_custom_email_templates_updated_at
BEFORE UPDATE ON public.custom_email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();