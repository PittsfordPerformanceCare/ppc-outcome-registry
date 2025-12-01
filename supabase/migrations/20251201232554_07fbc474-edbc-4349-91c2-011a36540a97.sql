
-- Drop the old constraint FIRST
ALTER TABLE referral_inquiries 
DROP CONSTRAINT IF EXISTS referral_inquiries_status_check;

-- Update existing 'pending' status to 'prospect_awaiting_review'
UPDATE referral_inquiries 
SET status = 'prospect_awaiting_review'
WHERE status = 'pending';

-- Add new constraint with correct status values
ALTER TABLE referral_inquiries
ADD CONSTRAINT referral_inquiries_status_check 
CHECK (status IN ('prospect_awaiting_review', 'approved', 'declined', 'scheduled', 'converted'));
