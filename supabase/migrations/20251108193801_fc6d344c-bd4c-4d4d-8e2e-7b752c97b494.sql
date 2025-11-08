-- Add clinician and npi fields to episodes table
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS clinician TEXT,
ADD COLUMN IF NOT EXISTS npi TEXT;