-- Commun Vivant Pro: agencies, users, commissions

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('base', 'pro', 'premium')),
  subscription_price NUMERIC(10,2) NOT NULL DEFAULT 490,
  subscription_renewal_date DATE NOT NULL,
  agency_credit NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(10,2) NOT NULL DEFAULT 20,
  display_name TEXT,
  partner_mention TEXT DEFAULT 'En partenariat avec Commun Vivant',
  logo_url TEXT,
  signature TEXT,
  primary_color TEXT,
  intro_page_text TEXT,
  custom_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agency_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'redacteur', 'lecture')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agency_id, user_id)
);

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS agency_commission NUMERIC(10,2) NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS commission_status TEXT NOT NULL DEFAULT 'pending' CHECK (commission_status IN ('pending', 'accounted')),
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  ADD COLUMN IF NOT EXISTS total_paid NUMERIC(10,2) NOT NULL DEFAULT 79;

ALTER TABLE solenn_documents
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_memories_agency_id ON memories(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_users_user_id ON agency_users(user_id);
CREATE INDEX IF NOT EXISTS idx_solenn_documents_agency_id ON solenn_documents(agency_id);

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agencies_updated_at ON agencies;
CREATE TRIGGER trg_agencies_updated_at
BEFORE UPDATE ON agencies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE OR REPLACE FUNCTION account_memorial_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agency_id IS NOT NULL
    AND COALESCE(OLD.payment_status, 'pending') = 'pending'
    AND NEW.payment_status = 'paid'
    AND COALESCE(NEW.commission_status, 'pending') = 'pending'
  THEN
    UPDATE agencies
    SET agency_credit = agency_credit + COALESCE(NEW.agency_commission, 20)
    WHERE id = NEW.agency_id;

    NEW.commission_status := 'accounted';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memories_account_commission ON memories;
CREATE TRIGGER trg_memories_account_commission
BEFORE UPDATE ON memories
FOR EACH ROW
EXECUTE FUNCTION account_memorial_commission();

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agencies_select_member ON agencies;
CREATE POLICY agencies_select_member ON agencies
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = agencies.id AND au.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS agencies_update_admin ON agencies;
CREATE POLICY agencies_update_admin ON agencies
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = agencies.id AND au.user_id = auth.uid() AND au.role = 'admin'
  )
);

DROP POLICY IF EXISTS agency_users_select_member ON agency_users;
CREATE POLICY agency_users_select_member ON agency_users
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM agency_users self
    WHERE self.agency_id = agency_users.agency_id AND self.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS agency_users_insert_admin ON agency_users;
CREATE POLICY agency_users_insert_admin ON agency_users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM agency_users self
    WHERE self.agency_id = agency_users.agency_id AND self.user_id = auth.uid() AND self.role = 'admin'
  )
);

DROP POLICY IF EXISTS agency_users_delete_admin ON agency_users;
CREATE POLICY agency_users_delete_admin ON agency_users
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM agency_users self
    WHERE self.agency_id = agency_users.agency_id AND self.user_id = auth.uid() AND self.role = 'admin'
  )
);

DROP POLICY IF EXISTS memories_select_agency_member ON memories;
CREATE POLICY memories_select_agency_member ON memories
FOR SELECT USING (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = memories.agency_id
      AND au.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS memories_update_agency_writer ON memories;
CREATE POLICY memories_update_agency_writer ON memories
FOR UPDATE USING (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = memories.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'redacteur')
  )
)
WITH CHECK (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = memories.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'redacteur')
  )
);

DROP POLICY IF EXISTS solenn_select_agency_member ON solenn_documents;
CREATE POLICY solenn_select_agency_member ON solenn_documents
FOR SELECT USING (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = solenn_documents.agency_id
      AND au.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS solenn_insert_agency_member ON solenn_documents;
CREATE POLICY solenn_insert_agency_member ON solenn_documents
FOR INSERT WITH CHECK (
  agency_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = solenn_documents.agency_id
      AND au.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS solenn_update_agency_writer ON solenn_documents;
CREATE POLICY solenn_update_agency_writer ON solenn_documents
FOR UPDATE USING (
  agency_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = solenn_documents.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'redacteur')
  )
)
WITH CHECK (
  agency_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM agency_users au
    WHERE au.agency_id = solenn_documents.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('admin', 'redacteur')
  )
);
