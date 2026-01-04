-- Create verified providers table for PCP auto-fill
CREATE TABLE public.verified_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name TEXT NOT NULL,
  practice_name TEXT,
  phone TEXT,
  fax TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for fast lookup by name
CREATE INDEX idx_verified_providers_name ON public.verified_providers USING gin(to_tsvector('english', provider_name));
CREATE INDEX idx_verified_providers_name_lower ON public.verified_providers (lower(provider_name));

-- Enable RLS (read-only for everyone, write for admins)
ALTER TABLE public.verified_providers ENABLE ROW LEVEL SECURITY;

-- Anyone can read verified providers (needed for intake form lookup)
CREATE POLICY "Anyone can view verified providers"
ON public.verified_providers
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage verified providers"
ON public.verified_providers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'owner')
  )
);

-- Trigger to update updated_at
CREATE TRIGGER update_verified_providers_updated_at
BEFORE UPDATE ON public.verified_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();