-- Add complaint tracking to episodes table
ALTER TABLE episodes
ADD COLUMN IF NOT EXISTS complaint_priority INTEGER,
ADD COLUMN IF NOT EXISTS source_intake_form_id UUID REFERENCES intake_forms(id);

COMMENT ON COLUMN episodes.complaint_priority IS 'Priority ranking of the complaint from the intake form (1=primary, 2=second, etc.)';
COMMENT ON COLUMN episodes.source_intake_form_id IS 'Link to the intake form this episode was created from';

-- Create pending_episodes table for multi-complaint workflow
CREATE TABLE IF NOT EXISTS pending_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_form_id UUID NOT NULL REFERENCES intake_forms(id) ON DELETE CASCADE,
  complaint_priority INTEGER NOT NULL,
  complaint_category TEXT,
  complaint_text TEXT,
  patient_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready_for_visit', 'scheduled', 'converted', 'deferred')),
  previous_episode_id TEXT REFERENCES episodes(id),
  scheduled_date DATE,
  deferred_reason TEXT,
  notes TEXT,
  user_id UUID NOT NULL,
  clinic_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE,
  converted_to_episode_id TEXT REFERENCES episodes(id)
);

COMMENT ON TABLE pending_episodes IS 'Tracks future episodes for patients with multiple complaints';
COMMENT ON COLUMN pending_episodes.status IS 'pending=awaiting discharge of current episode, ready_for_visit=patient agreed to continue, scheduled=appointment booked, converted=episode created, deferred=patient postponed';
COMMENT ON COLUMN pending_episodes.previous_episode_id IS 'The episode that was treating the previous complaint';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_episodes_intake_form ON pending_episodes(intake_form_id);
CREATE INDEX IF NOT EXISTS idx_pending_episodes_status ON pending_episodes(status);
CREATE INDEX IF NOT EXISTS idx_pending_episodes_user ON pending_episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_episodes_clinic ON pending_episodes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_episodes_source_intake ON episodes(source_intake_form_id);
CREATE INDEX IF NOT EXISTS idx_episodes_complaint_priority ON episodes(complaint_priority);

-- Enable RLS
ALTER TABLE pending_episodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_episodes
CREATE POLICY "Users can view own pending episodes"
  ON pending_episodes
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid()) 
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create own pending episodes"
  ON pending_episodes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update own pending episodes"
  ON pending_episodes
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid()) 
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can delete own pending episodes"
  ON pending_episodes
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );

-- Trigger for updated_at
CREATE TRIGGER update_pending_episodes_updated_at
  BEFORE UPDATE ON pending_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();