-- 1. Ajout de la date d'acceptation des CGU à la table commons
ALTER TABLE commons 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;

-- 2. Table de traçabilité des acceptations (Preuve juridique)
CREATE TABLE IF NOT EXISTS terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_id UUID REFERENCES commons(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Cases cochées
  has_rights_confirmed BOOLEAN DEFAULT false,
  no_illegal_content_confirmed BOOLEAN DEFAULT false,
  online_accessibility_confirmed BOOLEAN DEFAULT false,
  can_modify_confirmed BOOLEAN DEFAULT false,
  
  -- Traçabilité
  ip_address TEXT, -- IP de l'utilisateur (à anonymiser après 12 mois)
  user_agent TEXT, -- Navigateur utilisé
  accepted_at TIMESTAMP DEFAULT NOW()
);

-- 3. Table des signalements (Modération)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_id UUID REFERENCES commons(id),
  
  -- Raison du signalement
  reason TEXT CHECK (reason IN ('image_rights', 'defamation', 'illegal', 'other')),
  message TEXT,
  
  -- Contact du signalant
  reporter_email TEXT,
  
  -- Traçabilité
  ip_address TEXT,
  reported_at TIMESTAMP DEFAULT NOW(),
  
  -- Traitement
  status TEXT CHECK (status IN ('pending', 'reviewed', 'archived', 'deleted')) DEFAULT 'pending',
  admin_notes TEXT,
  resolved_at TIMESTAMP
);
