-- MVP guardrails: B2B identity, secure invite links, payment/commission edge cases, audit, lightweight transactional logs

-- 1) Future-proof B2B identity: group/network support
CREATE TABLE IF NOT EXISTS agency_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES agency_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agencies_group_id ON agencies(group_id);

-- 2) Extend agency roles (accounting-only use case)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agency_role') THEN
    ALTER TYPE agency_role ADD VALUE IF NOT EXISTS 'accountant';
  END IF;
END $$;

-- 3) Payment and commission statuses: explicit edge cases
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_commission_status') THEN
    ALTER TYPE memory_commission_status ADD VALUE IF NOT EXISTS 'reversed';
  END IF;
END $$;

-- Normalize commission_status type to enum when still text
DO $$
DECLARE
  v_udt_name text;
BEGIN
  SELECT c.udt_name
  INTO v_udt_name
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'memories'
    AND c.column_name = 'commission_status';

  IF v_udt_name IS NULL THEN
    ALTER TABLE memories
      ADD COLUMN commission_status memory_commission_status NOT NULL DEFAULT 'pending';
  ELSIF v_udt_name <> 'memory_commission_status' THEN
    ALTER TABLE memories
      ALTER COLUMN commission_status DROP DEFAULT;

    ALTER TABLE memories
      ALTER COLUMN commission_status TYPE memory_commission_status
      USING (
        CASE
          WHEN commission_status IN ('pending', 'accounted', 'reversed') THEN commission_status::memory_commission_status
          ELSE 'pending'::memory_commission_status
        END
      );

    ALTER TABLE memories
      ALTER COLUMN commission_status SET DEFAULT 'pending';
  END IF;
END $$;

ALTER TABLE memories
  DROP CONSTRAINT IF EXISTS memories_payment_status_user_check,
  DROP CONSTRAINT IF EXISTS memories_payment_status_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'memories_payment_status_mvp_check'
  ) THEN
    ALTER TABLE memories
      ADD CONSTRAINT memories_payment_status_mvp_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'canceled', 'refunded', 'chargeback'));
  END IF;
END $$;

-- 4) Secure family creation links (instead of raw agency query param)
CREATE TABLE IF NOT EXISTS agency_invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1 CHECK (max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agency_invite_links_agency ON agency_invite_links(agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agency_invite_links_expires ON agency_invite_links(expires_at);

-- 5) Onboarding invitations (first admin + team invite flow)
CREATE TABLE IF NOT EXISTS agency_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role agency_role NOT NULL DEFAULT 'viewer',
  token_hash TEXT NOT NULL UNIQUE,
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_invitations_agency ON agency_invitations(agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_email ON agency_invitations(lower(email));

-- 6) Lightweight transaction email log + anti-spam support
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
  provider TEXT,
  provider_message_id TEXT,
  send_status TEXT NOT NULL DEFAULT 'queued' CHECK (send_status IN ('queued', 'sent', 'failed', 'skipped')),
  dedupe_key TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_events_recipient_created ON email_events(recipient_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_event_created ON email_events(event_type, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_email_events_dedupe_key ON email_events(dedupe_key) WHERE dedupe_key IS NOT NULL;

-- 7) Suspension/reactivation audit trail
CREATE TABLE IF NOT EXISTS memory_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('suspend', 'reactivate', 'request_reactivation')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_access_audit_memory ON memory_access_audit(memory_id, created_at DESC);

-- 8) Billing documents index for family + agency portals
CREATE TABLE IF NOT EXISTS billing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('agency', 'user')),
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
