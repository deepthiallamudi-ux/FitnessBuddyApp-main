-- Buddy Sharing & Motivation Feature
-- Run this in your Supabase SQL Editor to enable buddy progress sharing

-- Create progress_shares table
CREATE TABLE IF NOT EXISTS progress_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sharer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL DEFAULT 'weekly_summary',
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  stats JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE progress_shares ENABLE ROW LEVEL SECURITY;

-- Users can share their own progress
CREATE POLICY IF NOT EXISTS "Users can share their own progress"
  ON progress_shares FOR INSERT
  WITH CHECK (sharer_id = auth.uid());

-- Users can view shared progress with them
CREATE POLICY IF NOT EXISTS "Users can view shared progress with them"
  ON progress_shares FOR SELECT
  USING (receiver_id = auth.uid() OR sharer_id = auth.uid());

-- Verify table was created
-- SELECT * FROM progress_shares LIMIT 1;
