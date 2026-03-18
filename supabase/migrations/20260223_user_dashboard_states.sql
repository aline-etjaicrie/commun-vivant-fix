-- User dashboard states and lifecycle fields for memories

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS formula TEXT DEFAULT 'essentiel',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memories_generation_status_check'
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT memories_generation_status_check
      CHECK (generation_status IN ('not_started', 'generated', 'edited'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memories_publication_status_check'
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT memories_publication_status_check
      CHECK (publication_status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memories_payment_status_user_check'
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT memories_payment_status_user_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'completed', 'refunded'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memories_user_created_at ON memories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_publication_status ON memories(publication_status);
