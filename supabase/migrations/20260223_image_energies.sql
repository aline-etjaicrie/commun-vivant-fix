-- Store user-validated image energies on memories
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS memory_image_energies TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_memories_image_energies_gin
  ON memories
  USING GIN (memory_image_energies);

