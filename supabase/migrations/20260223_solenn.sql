-- Solenn: stockage des ceremonies professionnelles
CREATE TABLE IF NOT EXISTS solenn_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (5, 10, 15)),
  ceremony_context TEXT NOT NULL,
  tone TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '{}'::jsonb,
  content TEXT NOT NULL,
  regeneration_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE solenn_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS solenn_select_own ON solenn_documents;
CREATE POLICY solenn_select_own ON solenn_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS solenn_insert_own ON solenn_documents;
CREATE POLICY solenn_insert_own ON solenn_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS solenn_update_own ON solenn_documents;
CREATE POLICY solenn_update_own ON solenn_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS solenn_delete_own ON solenn_documents;
CREATE POLICY solenn_delete_own ON solenn_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_solenn_documents_user_created_at
  ON solenn_documents (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_solenn_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_solenn_documents_updated_at ON solenn_documents;
CREATE TRIGGER trg_solenn_documents_updated_at
  BEFORE UPDATE ON solenn_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_solenn_documents_updated_at();
