-- Add the JSON payload column expected by the current memorial creation flow.

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_memories_data_gin
  ON memories
  USING GIN (data);
