-- Add template choice and palette storage
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS template_choice text DEFAULT 'classique',
ADD COLUMN IF NOT EXISTS color_palette jsonb;

-- Optional: Create enum type if strict validation needed, but text is more flexible for updates
-- CREATE TYPE template_type AS ENUM ('classique', 'moderne', 'intime', 'galerie');
-- ALTER TABLE memories ALTER COLUMN template_choice TYPE template_type USING template_choice::template_type;
