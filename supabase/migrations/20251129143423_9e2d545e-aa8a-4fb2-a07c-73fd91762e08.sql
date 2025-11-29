-- Add magic link token fields to patient_episode_access for passwordless authentication
ALTER TABLE patient_episode_access
ADD COLUMN magic_token TEXT UNIQUE,
ADD COLUMN token_expires_at TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX idx_patient_episode_access_magic_token ON patient_episode_access(magic_token);