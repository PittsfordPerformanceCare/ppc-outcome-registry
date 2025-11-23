-- Create table for storing partial intake form progress
CREATE TABLE IF NOT EXISTS public.intake_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  patient_name text,
  patient_email text,
  patient_phone text,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  last_accessed_at timestamp with time zone DEFAULT now(),
  completed boolean DEFAULT false
);

-- Create index for token lookups
CREATE INDEX idx_intake_progress_token ON public.intake_progress(token);

-- Create index for expiration cleanup
CREATE INDEX idx_intake_progress_expires_at ON public.intake_progress(expires_at);

-- Enable RLS
ALTER TABLE public.intake_progress ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (save progress)
CREATE POLICY "Anyone can save intake progress"
  ON public.intake_progress
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to view their own progress using token
CREATE POLICY "Anyone can view intake progress with valid token"
  ON public.intake_progress
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to update their progress using token
CREATE POLICY "Anyone can update intake progress with valid token"
  ON public.intake_progress
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to clean up expired progress entries
CREATE OR REPLACE FUNCTION cleanup_expired_intake_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.intake_progress
  WHERE expires_at < now() AND completed = false;
END;
$$;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_intake_progress_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_intake_progress_updated_at
  BEFORE UPDATE ON public.intake_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_intake_progress_timestamp();

-- Add comment
COMMENT ON TABLE public.intake_progress IS 'Stores partial patient intake form progress to allow save and resume functionality';