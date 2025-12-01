-- Update episode_type constraint to only allow MSK or Neuro
ALTER TABLE pending_episodes 
DROP CONSTRAINT IF EXISTS pending_episodes_episode_type_check;

ALTER TABLE pending_episodes 
ADD CONSTRAINT pending_episodes_episode_type_check 
CHECK (episode_type IN ('MSK', 'Neuro'));