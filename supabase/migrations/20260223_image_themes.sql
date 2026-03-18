-- Store user-validated dominant themes extracted from media analysis
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS image_themes JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_memories_image_themes_gin
  ON memories
  USING GIN (image_themes);

