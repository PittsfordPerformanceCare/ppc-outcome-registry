-- Create export templates table
CREATE TABLE public.export_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  export_type TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  recipient_emails TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.export_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own templates and shared templates in their clinic
CREATE POLICY "Users can view own and shared templates"
ON public.export_templates
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (is_shared = true AND clinic_id = get_user_clinic_id(auth.uid()))
  OR is_admin(auth.uid())
);

-- Users can create their own templates
CREATE POLICY "Users can create own templates"
ON public.export_templates
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
);

-- Users can update their own templates, admins can update shared templates
CREATE POLICY "Users can update own templates"
ON public.export_templates
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (is_shared = true AND is_admin(auth.uid()))
);

-- Users can delete their own templates, admins can delete any
CREATE POLICY "Users can delete own templates"
ON public.export_templates
FOR DELETE
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_export_templates_updated_at
  BEFORE UPDATE ON public.export_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();