-- Add foreign key relationship between patient_messages and episodes
ALTER TABLE patient_messages 
ADD CONSTRAINT patient_messages_episode_id_fkey 
FOREIGN KEY (episode_id) 
REFERENCES episodes(id) 
ON DELETE SET NULL;