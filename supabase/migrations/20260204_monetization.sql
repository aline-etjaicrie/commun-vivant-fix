-- 1. Mise à jour de la table commons
ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS context TEXT CHECK (context IN ('funeral', 'living_story', 'object_memory'));

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'archived', 'deleted')) DEFAULT 'draft';

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS base_price DECIMAL NOT NULL DEFAULT 69;

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS options_paid JSONB DEFAULT '{}'; 

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS total_paid DECIMAL DEFAULT 0;

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS renewed_count INTEGER DEFAULT 0;

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS owned_by UUID REFERENCES auth.users(id);

ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS backup_email TEXT;

-- 2. Table referrers (partenaires)
CREATE TABLE IF NOT EXISTS referrers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('funeral_partner', 'insurer')),
  subscription_fee DECIMAL NOT NULL,
  subscription_paid_until DATE,
  commission_rate_upsells DECIMAL,
  commission_rate_physical DECIMAL,
  commission_rate_renewals DECIMAL,
  cost_per_memorial DECIMAL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ajout de la clé étrangère referrer_id à commons après création de la table referrers
ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES referrers(id);

-- 3. Table transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_id UUID REFERENCES commons(id),
  type TEXT CHECK (type IN (
    'base_publication',
    'upsell',
    'physical_support',
    'renewal',
    'partner_subscription',
    'insurer_usage_fee'
  )),
  amount DECIMAL NOT NULL,
  platform_revenue DECIMAL NOT NULL,
  referrer_id UUID REFERENCES referrers(id),
  commission_amount DECIMAL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Table renewal_reminders
CREATE TABLE IF NOT EXISTS renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_id UUID REFERENCES commons(id),
  reminder_type TEXT CHECK (reminder_type IN ('6_months', '1_month', '1_week', 'expired')),
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
