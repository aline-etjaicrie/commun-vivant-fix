-- Align the legacy memories table with the current creation and generation flow.

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS context TEXT DEFAULT 'funeral',
  ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS style TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
