-- Drop the old foreign key that points to auth.users
ALTER TABLE patient_messages 
DROP CONSTRAINT patient_messages_patient_id_fkey;

-- Add new foreign key that points to patient_accounts
ALTER TABLE patient_messages 
ADD CONSTRAINT patient_messages_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patient_accounts(id) 
ON DELETE CASCADE;