-- Preprod bridge migration
-- Aligns the remote schema with the current app without replaying the old commons-based history.

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS template_choice TEXT DEFAULT 'classique',
  ADD COLUMN IF NOT EXISTS color_palette JSONB,
  ADD COLUMN IF NOT EXISTS image_themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS memory_image_energies TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS formula TEXT DEFAULT 'essentiel',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS qr_status TEXT DEFAULT 'not_generated',
  ADD COLUMN IF NOT EXISTS options_summary JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS agency_commission NUMERIC(10,2) NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS commission_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS total_paid NUMERIC(10,2) NOT NULL DEFAULT 0;

UPDATE memories
SET owner_user_id = user_id
WHERE owner_user_id IS NULL
  AND user_id IS NOT NULL;

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

ALTER TABLE memories
  DROP CONSTRAINT IF EXISTS memories_payment_status_user_check,
  DROP CONSTRAINT IF EXISTS memories_payment_status_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memories_payment_status_mvp_check'
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT memories_payment_status_mvp_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'canceled', 'completed', 'refunded', 'chargeback'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memories_owner_user_id ON memories(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_created_at ON memories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_publication_status ON memories(publication_status);
CREATE INDEX IF NOT EXISTS idx_memories_image_themes_gin ON memories USING GIN (image_themes);
CREATE INDEX IF NOT EXISTS idx_memories_image_energies_gin ON memories USING GIN (memory_image_energies);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_video_status') THEN
    CREATE TYPE memory_video_status AS ENUM ('draft', 'queued', 'rendering', 'completed', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS memory_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  music_id TEXT,
  photo_count_used INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  status memory_video_status NOT NULL DEFAULT 'draft',
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  video_storage_path TEXT,
  text_snippets JSONB NOT NULL DEFAULT '[]'::jsonb,
  photo_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_videos_memory_id ON memory_videos(memory_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_videos_user_id ON memory_videos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_videos_status ON memory_videos(status);

ALTER TABLE memory_videos ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_memory_videos_updated_at ON memory_videos;
CREATE TRIGGER trg_memory_videos_updated_at
BEFORE UPDATE ON memory_videos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

DROP POLICY IF EXISTS memory_videos_select_owner ON memory_videos;
CREATE POLICY memory_videos_select_owner ON memory_videos
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS memory_videos_insert_owner ON memory_videos;
CREATE POLICY memory_videos_insert_owner ON memory_videos
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS memory_videos_update_owner ON memory_videos;
CREATE POLICY memory_videos_update_owner ON memory_videos
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS billing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('agency', 'user')),
  agency_id UUID,
  user_id UUID,
  memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  hosted_invoice_url TEXT,
  receipt_url TEXT,
  invoice_pdf_url TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'eur',
  tax_amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'void', 'refunded')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_documents_agency ON billing_documents(agency_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_documents_user ON billing_documents(user_id, issued_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_documents_payment_intent
  ON billing_documents(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_membership_role') THEN
    CREATE TYPE memory_membership_role AS ENUM ('owner', 'editor', 'contributor', 'viewer');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_membership_status') THEN
    CREATE TYPE memory_membership_status AS ENUM ('invited', 'active', 'revoked');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_invite_status') THEN
    CREATE TYPE memory_invite_status AS ENUM ('pending', 'claimed', 'expired', 'revoked');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_contribution_status') THEN
    CREATE TYPE memory_contribution_status AS ENUM ('submitted', 'reviewed', 'archived');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS memory_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role memory_membership_role NOT NULL DEFAULT 'contributor',
  status memory_membership_status NOT NULL DEFAULT 'invited',
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_memberships_unique_email
  ON memory_memberships(memory_id, email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_memberships_unique_user
  ON memory_memberships(memory_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memory_memberships_memory
  ON memory_memberships(memory_id, status, role);

CREATE TABLE IF NOT EXISTS memory_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role memory_membership_role NOT NULL DEFAULT 'contributor',
  token TEXT NOT NULL UNIQUE,
  access_code TEXT,
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status memory_invite_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_invites_memory
  ON memory_invites(memory_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_invites_email
  ON memory_invites(email, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_invites_access_code
  ON memory_invites(access_code)
  WHERE access_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS memory_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memory_memberships(id) ON DELETE SET NULL,
  invite_id UUID REFERENCES memory_invites(id) ON DELETE SET NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_email TEXT,
  author_name TEXT,
  relationship_label TEXT,
  content TEXT NOT NULL,
  status memory_contribution_status NOT NULL DEFAULT 'submitted',
  source TEXT NOT NULL DEFAULT 'invite',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_contributions_memory
  ON memory_contributions(memory_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_contributions_author
  ON memory_contributions(author_email, created_at DESC);

CREATE TABLE IF NOT EXISTS memory_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  source TEXT NOT NULL DEFAULT 'dashboard',
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_activity_logs_memory
  ON memory_activity_logs(memory_id, created_at DESC);

ALTER TABLE memory_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS memory_memberships_select_related ON memory_memberships;
CREATE POLICY memory_memberships_select_related ON memory_memberships
FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_memberships.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS memory_invites_select_related ON memory_invites;
CREATE POLICY memory_invites_select_related ON memory_invites
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_invites.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM memory_memberships mm
    WHERE mm.memory_id = memory_invites.memory_id
      AND mm.user_id = auth.uid()
      AND mm.status = 'active'
  )
);

DROP POLICY IF EXISTS memory_contributions_select_related ON memory_contributions;
CREATE POLICY memory_contributions_select_related ON memory_contributions
FOR SELECT USING (
  author_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_contributions.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM memory_memberships mm
    WHERE mm.memory_id = memory_contributions.memory_id
      AND mm.user_id = auth.uid()
      AND mm.status = 'active'
  )
);

DROP POLICY IF EXISTS memory_activity_logs_select_related ON memory_activity_logs;
CREATE POLICY memory_activity_logs_select_related ON memory_activity_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_activity_logs.memory_id
      AND (m.owner_user_id = auth.uid() OR m.user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM memory_memberships mm
    WHERE mm.memory_id = memory_activity_logs.memory_id
      AND mm.user_id = auth.uid()
      AND mm.status = 'active'
  )
);

INSERT INTO memory_memberships (
  memory_id,
  user_id,
  email,
  role,
  status,
  invited_at,
  joined_at,
  created_at,
  updated_at
)
SELECT
  m.id,
  COALESCE(m.owner_user_id, m.user_id) AS user_id,
  lower(u.email) AS email,
  'owner'::memory_membership_role,
  'active'::memory_membership_status,
  COALESCE(m.created_at, now()),
  COALESCE(m.created_at, now()),
  COALESCE(m.created_at, now()),
  now()
FROM memories m
JOIN auth.users u ON u.id = COALESCE(m.owner_user_id, m.user_id)
WHERE COALESCE(m.owner_user_id, m.user_id) IS NOT NULL
  AND COALESCE(u.email, '') <> ''
ON CONFLICT DO NOTHING;

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
);
