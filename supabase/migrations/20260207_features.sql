-- 1. MODERATION COLUMNS & TRIGGER
ALTER TABLE memory_messages 
ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Trigger Function
CREATE OR REPLACE FUNCTION check_message_content()
RETURNS TRIGGER AS $$
DECLARE
  suspicious_words TEXT[] := ARRAY['spam', 'viagra', 'casino', 'xxx', 'buy'];
  word TEXT;
BEGIN
  FOREACH word IN ARRAY suspicious_words
  LOOP
    IF LOWER(NEW.content) LIKE '%' || word || '%' THEN
      NEW.flagged := true;
      NEW.flagged_reason := 'Mot suspect détecté: ' || word;
      NEW.approved := false; -- Auto-reject
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS message_content_check ON memory_messages;
CREATE TRIGGER message_content_check 
BEFORE INSERT ON memory_messages
FOR EACH ROW EXECUTE FUNCTION check_message_content();

-- 2. TEXT GENERATION COLUMNS
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS generated_text_original TEXT,
ADD COLUMN IF NOT EXISTS generated_text_edited TEXT,
ADD COLUMN IF NOT EXISTS text_manually_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS regeneration_limit INTEGER DEFAULT 3;
