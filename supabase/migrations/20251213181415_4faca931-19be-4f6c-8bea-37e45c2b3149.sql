-- Create a function to auto-link episodes to patient accounts based on email
CREATE OR REPLACE FUNCTION public.auto_link_patient_episodes(p_patient_account_id uuid, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_episode RECORD;
BEGIN
  -- Find all intake forms with matching email that have been converted to episodes
  FOR v_episode IN 
    SELECT e.id as episode_id
    FROM intake_forms i
    INNER JOIN episodes e ON e.source_intake_form_id = i.id
    WHERE LOWER(i.email) = LOWER(p_email)
      AND e.id IS NOT NULL
  LOOP
    -- Insert access record if it doesn't exist
    INSERT INTO patient_episode_access (patient_id, episode_id, granted_at, is_active)
    VALUES (p_patient_account_id, v_episode.episode_id, now(), true)
    ON CONFLICT (patient_id, episode_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Add unique constraint to prevent duplicate access records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'patient_episode_access_patient_episode_unique'
  ) THEN
    ALTER TABLE patient_episode_access 
    ADD CONSTRAINT patient_episode_access_patient_episode_unique 
    UNIQUE (patient_id, episode_id);
  END IF;
END $$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.auto_link_patient_episodes(uuid, text) TO authenticated;