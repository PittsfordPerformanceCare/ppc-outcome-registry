-- Add episode_type column to episodes table
ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS episode_type TEXT DEFAULT 'MSK' CHECK (episode_type IN ('MSK', 'Neurology'));

-- Add index for episode_type for faster queries
CREATE INDEX IF NOT EXISTS idx_episodes_episode_type ON episodes(episode_type);

-- Update existing episodes to be MSK type
UPDATE episodes SET episode_type = 'MSK' WHERE episode_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN episodes.episode_type IS 'Episode type: MSK for musculoskeletal, Neurology for neurological cases with RPQ outcomes';