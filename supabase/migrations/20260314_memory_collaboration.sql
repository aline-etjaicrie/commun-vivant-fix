-- Multi-contributor memories: memberships, invites, contributions and activity logs

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
  OR EXISTS (
    SELECT 1
    FROM memories m
    JOIN agency_users au ON au.agency_id = m.agency_id
    WHERE m.id = memory_memberships.memory_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
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
  OR EXISTS (
    SELECT 1
    FROM memories m
    JOIN agency_users au ON au.agency_id = m.agency_id
    WHERE m.id = memory_invites.memory_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
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
  OR EXISTS (
    SELECT 1
    FROM memories m
    JOIN agency_users au ON au.agency_id = m.agency_id
    WHERE m.id = memory_contributions.memory_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
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
  OR EXISTS (
    SELECT 1
    FROM memories m
    JOIN agency_users au ON au.agency_id = m.agency_id
    WHERE m.id = memory_activity_logs.memory_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'editor')
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
