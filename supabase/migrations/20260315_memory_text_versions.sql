-- Text version history for memorial writing and collaborative edits

CREATE TABLE IF NOT EXISTS memory_text_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email TEXT,
  actor_role TEXT,
  source TEXT NOT NULL DEFAULT 'dashboard',
  version_kind TEXT NOT NULL DEFAULT 'snapshot',
  style TEXT,
  content_text TEXT,
  content_html TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_text_versions_memory
  ON memory_text_versions(memory_id, created_at DESC);

ALTER TABLE memory_text_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS memory_text_versions_select_related ON memory_text_versions;
CREATE POLICY memory_text_versions_select_related ON memory_text_versions
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_text_versions.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM memory_memberships mm
    WHERE mm.memory_id = memory_text_versions.memory_id
      AND mm.user_id = auth.uid()
      AND mm.status = 'active'
  )
  OR EXISTS (
    SELECT 1
    FROM memories m
    JOIN agency_users au ON au.agency_id = m.agency_id
    WHERE m.id = memory_text_versions.memory_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
  )
);
