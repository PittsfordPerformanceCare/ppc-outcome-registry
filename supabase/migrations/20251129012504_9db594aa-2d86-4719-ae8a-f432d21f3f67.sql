-- Add unique constraint to patient_accounts email column
ALTER TABLE patient_accounts 
ADD CONSTRAINT patient_accounts_email_key UNIQUE (email);