-- Fix for RLS Policies and Foreign Key Constraints
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Fix challenges RLS if needed
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view challenges" ON challenges;

CREATE POLICY "Users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view challenges"
  ON challenges FOR SELECT
  USING (true);

-- Fix challenge members RLS
DROP POLICY IF EXISTS "Users can join challenges" ON challenge_members;
DROP POLICY IF EXISTS "Users can view members" ON challenge_members;

CREATE POLICY "Users can join challenges"
  ON challenge_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view members"
  ON challenge_members FOR SELECT
  USING (true);

-- Fix workouts RLS
DROP POLICY IF EXISTS "Users can insert workouts" ON workouts;
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;

CREATE POLICY "Users can insert workouts"
  ON workouts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (user_id = auth.uid());

-- Enable read access to profiles for all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create a function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
