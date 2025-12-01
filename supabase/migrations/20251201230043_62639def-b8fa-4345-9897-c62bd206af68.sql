-- Enhance pending_episodes to support pre-episode shells from referral inquiries
ALTER TABLE pending_episodes 
ALTER COLUMN intake_form_id DROP NOT NULL,
ALTER COLUMN date_of_birth DROP NOT NULL;

-- Add fields for episode type and body region classification
ALTER TABLE pending_episodes 
ADD COLUMN IF NOT EXISTS episode_type TEXT CHECK (episode_type IN ('MSK', 'Neuro', 'Performance')),
ADD COLUMN IF NOT EXISTS body_region TEXT,
ADD COLUMN IF NOT EXISTS referral_inquiry_id UUID REFERENCES referral_inquiries(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_episodes_referral_inquiry 
ON pending_episodes(referral_inquiry_id);

-- Add pending_episode_id to referral_inquiries to track the shell
ALTER TABLE referral_inquiries 
ADD COLUMN IF NOT EXISTS pending_episode_id UUID REFERENCES pending_episodes(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_inquiries_pending_episode 
ON referral_inquiries(pending_episode_id);