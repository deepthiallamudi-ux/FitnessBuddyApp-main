-- ============================================
-- FIX for Buddy Search & Leaderboard
-- Row Level Security Policies Update
-- ============================================
-- Run this in Supabase SQL Editor to allow users to see all other profiles/workouts

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can view their own goals" ON fitness_goals;

-- CREATE NEW POLICIES that allow reading all data (authenticated users only)

-- ============================================
-- PROFILES TABLE - Allow reading all profiles
-- ============================================
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Keep write restrictions to own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());


-- ============================================
-- WORKOUTS TABLE - Allow reading all workouts
-- ============================================
CREATE POLICY "Authenticated users can view all workouts"
  ON workouts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Keep write restrictions to own workouts
CREATE POLICY "Users can insert workouts"
  ON workouts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (user_id = auth.uid());


-- ============================================
-- FITNESS_GOALS TABLE - Allow reading all goals
-- ============================================
CREATE POLICY "Authenticated users can view all goals"
  ON fitness_goals FOR SELECT
  USING (auth.role() = 'authenticated');

-- Keep write restrictions to own goals
CREATE POLICY "Users can manage their own goals"
  ON fitness_goals FOR ALL
  USING (user_id = auth.uid());


-- ============================================
-- ACHIEVEMENTS TABLE - Allow reading all achievements
-- ============================================
CREATE POLICY "Authenticated users can view all achievements"
  ON achievements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own achievements"
  ON achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own achievements"
  ON achievements FOR DELETE
  USING (user_id = auth.uid());


-- ============================================
-- BUDDIES TABLE - Allow reading but restrict writes to own
-- ============================================
CREATE POLICY "Authenticated users can view all buddy connections"
  ON buddies FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create buddy requests"
  ON buddies FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update buddy requests"
  ON buddies FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete buddy requests"
  ON buddies FOR DELETE
  USING (user_id = auth.uid());


-- ============================================
-- SAVED_GYMS TABLE - Allow reading but restrict writes
-- ============================================
CREATE POLICY "Authenticated users can view all saved gyms"
  ON saved_gyms FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own saved gyms"
  ON saved_gyms FOR ALL
  USING (user_id = auth.uid());


-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see "Success" or no errors, the policies have been updated!
-- Now:
-- 1. All authenticated users can see other users' profiles
-- 2. All authenticated users can see other users' workouts
-- 3. All authenticated users can see other users' goals & achievements
-- 4. Buddy search should now show real users
-- 5. Leaderboard should now show all users
--
-- Security is maintained because:
-- - Users can only MODIFY/DELETE their own data
-- - Read access is open to authenticated users (same as social apps)
-- - Unauthenticated users still can't access anything
