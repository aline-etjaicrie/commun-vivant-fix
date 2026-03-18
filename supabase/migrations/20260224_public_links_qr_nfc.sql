-- Public URL + QR + NFC + visits tracking

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_access_status') THEN
    CREATE TYPE memory_access_status AS ENUM ('active', 'suspended');
  END IF;
END $$;

-- Agencies: stable slug for B2B public paths
ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE agencies
SET slug = regexp_replace(
  regexp_replace(lower(coalesce(name, 'agence') || '-' || substr(id::text, 1, 6)), '[^a-z0-9]+', '-', 'g'),
  '(^-|-$)',
  '',
  'g'
)
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_slug_unique
  ON agencies(slug)
  WHERE slug IS NOT NULL;

-- Memories: public identifiers and QR/NFC metadata
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS public_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_path TEXT,
  ADD COLUMN IF NOT EXISTS nfc_status TEXT DEFAULT 'none';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'memories_nfc_status_check'
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT memories_nfc_status_check
      CHECK (nfc_status IN ('none', 'encoded', 'delivered'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_slug_unique
  ON memories(slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memories_publication_access
  ON memories(publication_status, access_status);

-- Backfill simple slug on existing rows if empty
UPDATE memories
SET slug = regexp_replace(
  regexp_replace(lower('memoire-' || substr(id::text, 1, 8)), '[^a-z0-9]+', '-', 'g'),
  '(^-|-$)',
  '',
  'g'
)
WHERE slug IS NULL OR slug = '';

-- Optional link registry (stable path + analytics friendly)
CREATE TABLE IF NOT EXISTS memory_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_links_memory
  ON memory_links(memory_id, created_at DESC);

-- Public visits analytics
CREATE TABLE IF NOT EXISTS memory_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  ref TEXT NOT NULL DEFAULT 'unknown' CHECK (ref IN ('qr', 'nfc', 'direct', 'unknown')),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_visits_memory_date
  ON memory_visits(memory_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_visits_agency_date
  ON memory_visits(agency_id, created_at DESC);

-- Refresh agency view to expose slug for URL generation
DROP VIEW IF EXISTS agency_memories_view;
DROP FUNCTION IF EXISTS agency_memories_for_current_user();

CREATE OR REPLACE FUNCTION agency_memories_for_current_user()
RETURNS TABLE (
  id UUID,
  agency_id UUID,
  slug TEXT,
  created_at TIMESTAMPTZ,
  payment_status TEXT,
  publication_status TEXT,
  access_status memory_access_status,
  qr_status TEXT,
  options_summary JSONB,
  dossier_label TEXT,
  agency_internal_note TEXT,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.agency_id,
    m.slug,
    m.created_at,
    m.payment_status,
    m.publication_status,
    m.access_status,
    m.qr_status,
    m.options_summary,
    m.dossier_label,
    m.agency_internal_note,
    m.suspended_at,
    m.suspension_reason
  FROM memories m
  WHERE m.agency_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM agency_users au
      WHERE au.agency_id = m.agency_id
        AND au.user_id = auth.uid()
    );
$$;

CREATE VIEW agency_memories_view AS
SELECT * FROM agency_memories_for_current_user();

GRANT SELECT ON agency_memories_view TO authenticated;
