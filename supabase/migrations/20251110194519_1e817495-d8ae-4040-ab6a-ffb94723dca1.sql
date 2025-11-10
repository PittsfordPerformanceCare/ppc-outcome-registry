-- Create storage bucket for clinic logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-logos',
  'clinic-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
);

-- Create clinic_settings table
CREATE TABLE public.clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name TEXT NOT NULL DEFAULT 'PPC Outcome Registry',
  tagline TEXT DEFAULT 'NeuroEdvance',
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view clinic settings
CREATE POLICY "Clinic settings are viewable by everyone"
ON public.clinic_settings
FOR SELECT
USING (true);

-- Only admins can update clinic settings
CREATE POLICY "Only admins can update clinic settings"
ON public.clinic_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Only admins can insert clinic settings
CREATE POLICY "Only admins can insert clinic settings"
ON public.clinic_settings
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_clinic_settings_updated_at
BEFORE UPDATE ON public.clinic_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.clinic_settings (clinic_name, tagline, phone, email)
VALUES ('PPC Outcome Registry', 'NeuroEdvance', '(555) 123-4567', 'contact@clinic.com');

-- Storage policies for clinic logos
CREATE POLICY "Clinic logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'clinic-logos');

CREATE POLICY "Admins can upload clinic logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'clinic-logos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update clinic logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'clinic-logos' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete clinic logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'clinic-logos' AND public.is_admin(auth.uid()));