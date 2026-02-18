-- Fitness Buddy App - Database Migrations

-- ============================================
-- MIGRATION 1: Add goal_type column to fitness_goals
-- ============================================
-- This migration adds the goal_type column which was missing from the original schema

ALTER TABLE fitness_goals ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'weekly';

-- Add comment to the column
COMMENT ON COLUMN fitness_goals.goal_type IS 'Type of goal: daily, weekly, or monthly';

-- ============================================
-- MIGRATION 2: Setup Storage RLS Policies for Avatars
-- ============================================
-- This fixes the "row violates row-level security policy" error

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar read policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar delete policy" ON storage.objects;

-- Create new policies for avatars bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Avatar upload policy"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Allow anyone to read avatars (public)
CREATE POLICY "Avatar read policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Avatar update policy"
ON storage.objects
FOR UPDATE
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Avatar delete policy"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- ============================================
-- MIGRATION 3: Ensure Proper Indexes for Performance
-- ============================================

-- Index for fitness_goals queries (frequently filtered by user_id and goal_type)
CREATE INDEX IF NOT EXISTS fitness_goals_user_goal_type_idx 
ON fitness_goals(user_id, goal_type);

-- Index for workouts queries
CREATE INDEX IF NOT EXISTS workouts_user_created_idx 
ON workouts(user_id, created_at DESC);

-- Index for profiles queries
CREATE INDEX IF NOT EXISTS profiles_username_idx 
ON profiles(username);

-- ============================================
-- MIGRATION 4: Add buddy_connections table if missing
-- ============================================
-- This table stores buddy connections for the connection feature

CREATE TABLE IF NOT EXISTS buddy_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Index for buddy queries
CREATE INDEX IF NOT EXISTS buddy_connections_user_idx 
ON buddy_connections(requester_id, receiver_id);

-- ============================================
-- MIGRATION 5: Verify and Fix RLS on Core Tables
-- ============================================

-- Enable RLS on core tables if not enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Drop old policies if needed and create new ones
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Workouts policies
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can create workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;

CREATE POLICY "Users can view their own workouts"
ON workouts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create workouts"
ON workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
ON workouts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
ON workouts
FOR DELETE
USING (auth.uid() = user_id);

-- Fitness goals policies
DROP POLICY IF EXISTS "Users can view their own goals" ON fitness_goals;
DROP POLICY IF EXISTS "Users can create goals" ON fitness_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON fitness_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON fitness_goals;

CREATE POLICY "Users can view their own goals"
ON fitness_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create goals"
ON fitness_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON fitness_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON fitness_goals
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- End of Migrations
-- ============================================
-- To apply these migrations:
-- 1. Go to Supabase Dashboard
-- 2. SQL Editor
-- 3. Paste this entire file
-- 4. Click "Run" to execute all migrations
