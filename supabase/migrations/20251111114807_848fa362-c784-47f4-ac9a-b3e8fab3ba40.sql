-- Table for patient messages to care team
CREATE TABLE patient_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  episode_id TEXT,
  message_type TEXT NOT NULL CHECK (message_type IN ('message', 'callback_request')),
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  clinician_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for post-discharge feedback
CREATE TABLE patient_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  episode_id TEXT NOT NULL,
  recovery_surprise TEXT,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
  would_recommend BOOLEAN,
  additional_comments TEXT,
  allow_testimonial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_messages
CREATE POLICY "Patients can view own messages"
  ON patient_messages FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create own messages"
  ON patient_messages FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view messages for their episodes"
  ON patient_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM episodes e
      WHERE e.id = patient_messages.episode_id
      AND (e.user_id = auth.uid() OR e.clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      ))
    ) OR is_admin(auth.uid())
  );

CREATE POLICY "Clinicians can update messages"
  ON patient_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM episodes e
      WHERE e.id = patient_messages.episode_id
      AND (e.user_id = auth.uid() OR e.clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      ))
    ) OR is_admin(auth.uid())
  );

-- RLS Policies for patient_feedback
CREATE POLICY "Patients can view own feedback"
  ON patient_feedback FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create own feedback"
  ON patient_feedback FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view feedback for their episodes"
  ON patient_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM episodes e
      WHERE e.id = patient_feedback.episode_id
      AND (e.user_id = auth.uid() OR e.clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      ))
    ) OR is_admin(auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_patient_messages_patient_id ON patient_messages(patient_id);
CREATE INDEX idx_patient_messages_episode_id ON patient_messages(episode_id);
CREATE INDEX idx_patient_messages_status ON patient_messages(status);
CREATE INDEX idx_patient_feedback_patient_id ON patient_feedback(patient_id);
CREATE INDEX idx_patient_feedback_episode_id ON patient_feedback(episode_id);

-- Update trigger
CREATE TRIGGER update_patient_messages_updated_at
  BEFORE UPDATE ON patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();