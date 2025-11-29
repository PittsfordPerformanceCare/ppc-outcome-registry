-- Drop outdated foreign key tying patient_accounts.id to another table
ALTER TABLE patient_accounts
DROP CONSTRAINT IF EXISTS patient_accounts_id_fkey;