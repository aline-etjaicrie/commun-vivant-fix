-- EPIC structure + RLS + agency view hardening

-- 1) Canonical enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agency_role') THEN
    CREATE TYPE agency_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_created_by') THEN
    CREATE TYPE memory_created_by AS ENUM ('user', 'agency');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_commission_status') THEN
    CREATE TYPE memory_commission_status AS ENUM ('pending', 'accounted');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_access_status') THEN
    CREATE TYPE memory_access_status AS ENUM ('active', 'suspended');
  END IF;
END $$;

-- 2) agencies shape (ticket 1.1)
ALTER TABLE agencies
  ALTER COLUMN subscription_price TYPE integer USING COALESCE(subscription_price::integer, 0),
  ALTER COLUMN agency_credit TYPE integer USING COALESCE(agency_credit::integer, 0),
  ALTER COLUMN commission_rate TYPE integer USING COALESCE(commission_rate::integer, 20),
  ALTER COLUMN subscription_renewal_date TYPE timestamptz USING subscription_renewal_date::timestamptz;

-- 3) agency_users role enum migration (ticket 1.2)
ALTER TABLE agency_users
  ALTER COLUMN role TYPE text;

UPDATE agency_users SET role = 'editor' WHERE role = 'redacteur';
UPDATE agency_users SET role = 'viewer' WHERE role = 'lecture';

ALTER TABLE agency_users
  DROP CONSTRAINT IF EXISTS agency_users_role_check;

ALTER TABLE agency_users
  ALTER COLUMN role TYPE agency_role USING role::agency_role;

-- 4) memories enrichments (ticket 1.3 + suspension + agency notes)
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by memory_created_by DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS agency_commission integer DEFAULT 20,
  ADD COLUMN IF NOT EXISTS commission_status memory_commission_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS access_status memory_access_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_by_agency_id uuid REFERENCES agencies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS agency_internal_note text,
  ADD COLUMN IF NOT EXISTS qr_status text DEFAULT 'not_generated',
  ADD COLUMN IF NOT EXISTS options_summary jsonb DEFAULT '{}'::jsonb;

UPDATE memories
SET owner_user_id = user_id
WHERE owner_user_id IS NULL AND user_id IS NOT NULL;

UPDATE memories
SET created_by = CASE WHEN agency_id IS NOT NULL THEN 'agency'::memory_created_by ELSE 'user'::memory_created_by END
WHERE created_by IS NULL;

CREATE INDEX IF NOT EXISTS idx_memories_owner_user_id ON memories(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_memories_access_status ON memories(access_status);

-- Restrict agency updates to governance fields only
CREATE OR REPLACE FUNCTION enforce_agency_memory_update_scope()
RETURNS TRIGGER AS $$
DECLARE
  is_agency_member boolean;
  is_owner boolean;
  old_guarded jsonb;
  new_guarded jsonb;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = NEW.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
  ) INTO is_agency_member;

  is_owner := (NEW.owner_user_id = auth.uid() OR NEW.user_id = auth.uid());

  IF is_agency_member AND NOT is_owner THEN
    old_guarded := to_jsonb(OLD) - ARRAY[
      'access_status',
      'suspended_at',
      'suspended_by_agency_id',
      'suspension_reason',
      'agency_internal_note',
      'updated_at'
    ];
    new_guarded := to_jsonb(NEW) - ARRAY[
      'access_status',
      'suspended_at',
      'suspended_by_agency_id',
      'suspension_reason',
      'agency_internal_note',
      'updated_at'
    ];

    IF new_guarded IS DISTINCT FROM old_guarded THEN
      RAISE EXCEPTION 'Agency can only update access/suspension/internal note fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_agency_memory_update_scope ON memories;
CREATE TRIGGER trg_enforce_agency_memory_update_scope
BEFORE UPDATE ON memories
FOR EACH ROW
EXECUTE FUNCTION enforce_agency_memory_update_scope();

-- 5) RLS hardening
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_messages ENABLE ROW LEVEL SECURITY;

-- Family policies
DROP POLICY IF EXISTS memories_select_owner ON memories;
CREATE POLICY memories_select_owner ON memories
FOR SELECT USING (
  owner_user_id = auth.uid() OR user_id = auth.uid()
);

DROP POLICY IF EXISTS memories_update_owner ON memories;
CREATE POLICY memories_update_owner ON memories
FOR UPDATE USING (
  owner_user_id = auth.uid() OR user_id = auth.uid()
)
WITH CHECK (
  owner_user_id = auth.uid() OR user_id = auth.uid()
);

DROP POLICY IF EXISTS memory_media_insert_owner ON memory_media;
CREATE POLICY memory_media_insert_owner ON memory_media
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_media.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS memory_media_delete_owner ON memory_media;
CREATE POLICY memory_media_delete_owner ON memory_media
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_media.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS memory_messages_insert_owner ON memory_messages;
CREATE POLICY memory_messages_insert_owner ON memory_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_messages.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
);

-- Agency update-only policy on allowed governance fields
DROP POLICY IF EXISTS memories_update_agency_writer ON memories;
DROP POLICY IF EXISTS memories_update_agency_access ON memories;
CREATE POLICY memories_update_agency_access ON memories
FOR UPDATE USING (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM agency_users au
    WHERE au.agency_id = memories.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM agency_users au
    WHERE au.agency_id = memories.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
  )
);

-- Remove broad agency read on base memories table
DROP POLICY IF EXISTS memories_select_agency_member ON memories;

-- 6) Agency view with whitelisted columns (ticket 2.3)
DROP FUNCTION IF EXISTS agency_memories_for_current_user();
CREATE OR REPLACE FUNCTION agency_memories_for_current_user()
RETURNS TABLE (
  id uuid,
  agency_id uuid,
  created_at timestamptz,
  payment_status text,
  publication_status text,
  access_status memory_access_status,
  qr_status text,
  options_summary jsonb,
  dossier_label text,
  agency_internal_note text,
  suspended_at timestamptz,
  suspended_by_agency_id uuid,
  suspension_reason text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.agency_id,
    m.created_at,
    m.payment_status,
    m.publication_status,
    m.access_status,
    m.qr_status,
    m.options_summary,
    COALESCE(
      NULLIF(m.firstname, ''),
      NULLIF((m.data->'identite'->>'prenom'), ''),
      NULLIF((m.data->>'prenom'), ''),
      'Dossier'
    ) AS dossier_label,
    m.agency_internal_note,
    m.suspended_at,
    m.suspended_by_agency_id,
    m.suspension_reason
  FROM memories m
  WHERE m.agency_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM agency_users au
      WHERE au.agency_id = m.agency_id
        AND au.user_id = auth.uid()
    );
$$;

DROP VIEW IF EXISTS agency_memories_view;
CREATE VIEW agency_memories_view AS
SELECT * FROM agency_memories_for_current_user();

GRANT SELECT ON agency_memories_view TO authenticated;

-- 7) Tighten Solenn policy role names
DROP POLICY IF EXISTS solenn_update_agency_writer ON solenn_documents;
CREATE POLICY solenn_update_agency_writer ON solenn_documents
FOR UPDATE USING (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = solenn_documents.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  agency_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = solenn_documents.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
  )
);
