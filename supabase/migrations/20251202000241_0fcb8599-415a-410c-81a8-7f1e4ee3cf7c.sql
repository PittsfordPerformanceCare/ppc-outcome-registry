-- Create table for Google Calendar connection
CREATE TABLE IF NOT EXISTS google_calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  calendar_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  calendar_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(clinic_id, calendar_id)
);

-- Create table for appointment sync tracking
CREATE TABLE IF NOT EXISTS intake_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_form_id UUID REFERENCES intake_forms(id) ON DELETE CASCADE,
  google_event_id TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  calendar_connection_id UUID REFERENCES google_calendar_connections(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(intake_form_id)
);

-- Create table for sync history
CREATE TABLE IF NOT EXISTS calendar_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES google_calendar_connections(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'manual' or 'automatic'
  appointments_checked INTEGER DEFAULT 0,
  appointments_found INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  error_message TEXT,
  triggered_by UUID
);

-- Add RLS policies
ALTER TABLE google_calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_history ENABLE ROW LEVEL SECURITY;

-- Calendar connections - only admins can manage
CREATE POLICY "Admins can manage calendar connections" ON google_calendar_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Intake appointments - clinicians can view and manage
CREATE POLICY "Clinicians can view intake appointments" ON intake_appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can create intake appointments" ON intake_appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update intake appointments" ON intake_appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Sync history - clinicians can view
CREATE POLICY "Clinicians can view sync history" ON calendar_sync_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_google_calendar_connections_updated_at
  BEFORE UPDATE ON google_calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intake_appointments_updated_at
  BEFORE UPDATE ON intake_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();