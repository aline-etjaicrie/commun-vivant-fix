-- Phase 2 - Family video module

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

DROP TRIGGER IF EXISTS trg_memory_videos_updated_at ON memory_videos;
CREATE TRIGGER trg_memory_videos_updated_at
BEFORE UPDATE ON memory_videos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

ALTER TABLE memory_videos ENABLE ROW LEVEL SECURITY;

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

