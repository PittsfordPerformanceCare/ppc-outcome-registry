-- Add owner_type enum
CREATE TYPE public.task_owner_type AS ENUM ('ADMIN', 'CLINICIAN');

-- Add owner_type column to communication_tasks
ALTER TABLE public.communication_tasks 
ADD COLUMN owner_type public.task_owner_type NOT NULL DEFAULT 'CLINICIAN';

-- Add new admin task types to the existing enum
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'PATIENT_CALLBACK';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'PATIENT_EMAIL_RESPONSE';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'PORTAL_MESSAGE_RESPONSE';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'RESEND_INTAKE_FORMS';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'FOLLOWUP_INCOMPLETE_FORMS';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'SEND_RECEIPT';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'ORDER_IMAGING';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'SCHEDULE_APPOINTMENT';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'CONFIRM_APPOINTMENT';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'REQUEST_OUTSIDE_RECORDS';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'SEND_RECORDS_TO_PATIENT';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'UPDATE_PATIENT_CONTACT';
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'DOCUMENT_PATIENT_REQUEST';

-- Create index for efficient filtering by owner_type
CREATE INDEX idx_communication_tasks_owner_type ON public.communication_tasks(owner_type);

-- Add comment for documentation
COMMENT ON COLUMN public.communication_tasks.owner_type IS 'Indicates whether task is owned by admin or clinician staff';