-- =========================================================
-- Commun Vivant - Bootstrap PROD (idempotent)
-- =========================================================
-- Ce script prépare rapidement un environnement opérationnel:
-- 1) Slugs publics + QR/NFC + visites (si pas déjà fait)
-- 2) Bucket Storage qr-codes
-- 3) Agence démo PF co-brandée
-- 4) Rattachement d'un utilisateur (email) comme admin agence
--
-- AVANT D'EXÉCUTER:
-- - Remplace v_admin_email si tu veux auto-rattacher un compte réel.
-- - Tu peux relancer ce script sans casser l'existant.
-- =========================================================

-- 0) Prérequis objets de base (si la migration dédiée n'a pas encore tourné)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_access_status') THEN
    CREATE TYPE memory_access_status AS ENUM ('active', 'suspended');
  END IF;
END $$;

ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS public_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_path TEXT,
  ADD COLUMN IF NOT EXISTS nfc_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS access_status memory_access_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS qr_status TEXT DEFAULT 'not_generated',
  ADD COLUMN IF NOT EXISTS options_summary JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS agency_internal_note TEXT,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memories_nfc_status_check'
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT memories_nfc_status_check
      CHECK (nfc_status IN ('none', 'encoded', 'delivered'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_slug_unique
  ON agencies(slug)
  WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_slug_unique
  ON memories(slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memories_publication_access
  ON memories(publication_status, access_status);

UPDATE agencies
SET slug = regexp_replace(
  regexp_replace(lower(coalesce(name, 'agence') || '-' || substr(id::text, 1, 6)), '[^a-z0-9]+', '-', 'g'),
  '(^-|-$)',
  '',
  'g'
)
WHERE slug IS NULL OR slug = '';

UPDATE memories
SET slug = regexp_replace(
  regexp_replace(lower('memoire-' || substr(id::text, 1, 8)), '[^a-z0-9]+', '-', 'g'),
  '(^-|-$)',
  '',
  'g'
)
WHERE slug IS NULL OR slug = '';

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

-- 1) Bucket Storage pour QR
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qr-codes',
  'qr-codes',
  false,
  5242880,
  ARRAY['image/png']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies storage: on reste strict (bucket privé).
-- Les uploads/signatures se font via service role dans l'API.

-- 2) Agence démo PF co-brandée
DO $$
DECLARE
  v_agency_id UUID;
  v_admin_email TEXT := 'aline-w@hotmail.fr'; -- adapte ici si besoin
  v_user_id UUID;
BEGIN
  SELECT id
  INTO v_agency_id
  FROM agencies
  WHERE slug = 'durand-funeraire'
  LIMIT 1;

  IF v_agency_id IS NULL THEN
    INSERT INTO agencies (
      id,
      name,
      slug,
      subscription_type,
      subscription_price,
      subscription_renewal_date,
      agency_credit,
      commission_rate,
      display_name,
      partner_mention,
      logo_url,
      primary_color,
      custom_message,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      'Durand Funeraire',
      'durand-funeraire',
      'pro',
      490,
      (now() + interval '1 year')::date,
      0,
      20,
      'Pompes Funebres Durand',
      'En partenariat avec Commun Vivant',
      '/pf-demo-logo.svg',
      '#13212E',
      'Accompagnement des familles avec discretion et humanite.',
      now()
    )
    RETURNING id INTO v_agency_id;
  ELSE
    UPDATE agencies
    SET
      name = 'Durand Funeraire',
      display_name = 'Pompes Funebres Durand',
      partner_mention = 'En partenariat avec Commun Vivant',
      logo_url = '/pf-demo-logo.svg',
      primary_color = '#13212E',
      custom_message = 'Accompagnement des familles avec discretion et humanite.'
    WHERE id = v_agency_id;
  END IF;

  -- 3) Rattacher un utilisateur existant comme admin d'agence (optionnel)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_admin_email)
  LIMIT 1;

  IF v_user_id IS NOT NULL AND v_agency_id IS NOT NULL THEN
    INSERT INTO agency_users (id, agency_id, user_id, role, created_at)
    VALUES (gen_random_uuid(), v_agency_id, v_user_id, 'admin', now())
    ON CONFLICT (agency_id, user_id) DO UPDATE
    SET role = 'admin';
  END IF;
END $$;

-- 4) Refresh vue agence si présente dans ce projet
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
    COALESCE(
      NULLIF(m.firstname, ''),
      'Dossier'
    ) AS dossier_label,
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
