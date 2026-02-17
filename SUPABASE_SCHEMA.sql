-- Fitness Buddy App - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  age INTEGER,
  location TEXT,
  goal TEXT,
  workout TEXT,
  weekly_goal INTEGER DEFAULT 150,
  avatar_url TEXT,
  latitude FLOAT,
  longitude FLOAT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- WORKOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  distance FLOAT,
  calories INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FITNESS_GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target FLOAT NOT NULL,
  current FLOAT DEFAULT 0,
  unit TEXT,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  target FLOAT NOT NULL,
  unit TEXT,
  duration TEXT,
  reward_badge TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CHALLENGE_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS challenge_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress FLOAT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- ============================================
-- BUDDIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS buddies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, buddy_id)
);

-- ============================================
-- SAVED_GYMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id INTEGER,
  gym_name TEXT,
  gym_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement TEXT,
  badge_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CHAT_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- WORKOUT_GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- GROUP_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES workout_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_members_user_id ON challenge_members(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_members_challenge_id ON challenge_members(challenge_id);
CREATE INDEX IF NOT EXISTS idx_buddies_user_id ON buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_gyms_user_id ON saved_gyms(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Workouts: Users can view their own workouts
CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (user_id = auth.uid());

-- Workouts: Users can insert their own workouts
CREATE POLICY "Users can insert workouts"
  ON workouts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Workouts: Users can update their own workouts
CREATE POLICY "Users can update their own workouts"
  ON workouts FOR UPDATE
  USING (user_id = auth.uid());

-- Fitness Goals: Users can view their own goals
CREATE POLICY "Users can view their own goals"
  ON fitness_goals FOR SELECT
  USING (user_id = auth.uid());

-- Fitness Goals: Users can manage their own goals
CREATE POLICY "Users can manage their own goals"
  ON fitness_goals FOR ALL
  USING (user_id = auth.uid());

-- Chat Messages: Users can view their messages
CREATE POLICY "Users can view their messages"
  ON chat_messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Chat Messages: Users can send messages
CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- ============================================
-- HELP: How to use this schema
-- ============================================
/*

1. Copy all the SQL above
2. Go to your Supabase project
3. Navigate to SQL Editor
4. Create a new query
5. Paste all the SQL
6. Click "Run" to execute

This will create:
- 10+ tables for storing user data
- Indexes for better query performance
- Row Level Security policies to protect user data
- All necessary relationships between tables

The schema supports:
- User profiles with fitness info
- Workout logging and tracking
- Goal management
- Challenges and competitions
- Buddy connections
- Achievement tracking
- Direct messaging
- Gym favorites
- Workout groups

*/
