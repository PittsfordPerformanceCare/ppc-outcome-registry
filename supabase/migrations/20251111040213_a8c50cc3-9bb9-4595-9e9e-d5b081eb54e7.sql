-- Add is_active field to patient_episode_access table
ALTER TABLE patient_episode_access 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;