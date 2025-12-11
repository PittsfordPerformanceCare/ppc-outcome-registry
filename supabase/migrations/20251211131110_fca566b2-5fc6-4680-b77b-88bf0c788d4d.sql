-- Create a trigger function to auto-create communication_tasks when patient_messages are inserted
CREATE OR REPLACE FUNCTION public.create_communication_task_from_patient_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_clinician_id uuid;
  v_patient_name text;
  v_due_at timestamp with time zone;
BEGIN
  -- Get the responsible clinician from the episode
  IF NEW.episode_id IS NOT NULL THEN
    SELECT user_id INTO v_clinician_id
    FROM episodes
    WHERE id = NEW.episode_id
    LIMIT 1;
  END IF;

  -- If no clinician from episode, try to get from patient's most recent active episode
  IF v_clinician_id IS NULL THEN
    SELECT e.user_id INTO v_clinician_id
    FROM patient_episode_access pea
    JOIN episodes e ON e.id = pea.episode_id
    WHERE pea.patient_id = NEW.patient_id
      AND pea.is_active = true
      AND e.discharge_date IS NULL
    ORDER BY e.created_at DESC
    LIMIT 1;
  END IF;

  -- Get patient name from patient_accounts
  SELECT full_name INTO v_patient_name
  FROM patient_accounts
  WHERE id = NEW.patient_id;

  -- Set due date to 24 hours from now
  v_due_at := now() + interval '24 hours';

  -- Only create task if we found a clinician
  IF v_clinician_id IS NOT NULL THEN
    INSERT INTO communication_tasks (
      patient_id,
      patient_name,
      episode_id,
      assigned_clinician_id,
      type,
      source,
      description,
      priority,
      status,
      due_at,
      patient_message_id
    ) VALUES (
      NEW.patient_id,
      COALESCE(v_patient_name, 'Unknown Patient'),
      NEW.episode_id,
      v_clinician_id,
      'PATIENT_MESSAGE',
      'PATIENT_PORTAL',
      COALESCE(NEW.subject, LEFT(NEW.message, 100)),
      CASE WHEN NEW.message_type = 'callback_request' THEN 'HIGH' ELSE 'NORMAL' END,
      'OPEN',
      v_due_at,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS create_task_on_patient_message ON patient_messages;
CREATE TRIGGER create_task_on_patient_message
  AFTER INSERT ON patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_communication_task_from_patient_message();