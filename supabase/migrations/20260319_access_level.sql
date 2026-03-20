-- Ajout du champ access_level sur la table memories
-- Représente le choix d'accès fait par l'utilisateur lors de la publication
-- Valeurs : 'ouvert' | 'restreint' | 'a_definir_plus_tard'
-- Distinct de access_status qui est réservé à la modération admin (active/suspended)

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS access_level TEXT NOT NULL DEFAULT 'a_definir_plus_tard'
    CHECK (access_level IN ('ouvert', 'restreint', 'a_definir_plus_tard'));

CREATE INDEX IF NOT EXISTS idx_memories_access_level
  ON memories(access_level);

COMMENT ON COLUMN memories.access_level IS
  'Niveau d''accès choisi par l''utilisateur : ouvert (lien/QR/NFC), restreint (bloqué publiquement), a_definir_plus_tard (en attente de confirmation).';
