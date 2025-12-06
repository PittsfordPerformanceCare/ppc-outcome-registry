-- Add missing columns to leads table for full lead capture support
-- This is additive only - no existing columns or RLS policies are modified

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS who_is_this_for text,
ADD COLUMN IF NOT EXISTS primary_concern text,
ADD COLUMN IF NOT EXISTS symptom_summary text,
ADD COLUMN IF NOT EXISTS preferred_contact_method text,
ADD COLUMN IF NOT EXISTS notes text;