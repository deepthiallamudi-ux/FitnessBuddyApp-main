# Buddy Sharing & Motivation Feature 🤝

## Overview
Users can now **share their workout logs and fitness progress** with connected buddies to provide motivation and celebrate achievements together!

---

## ✨ Features

### 1. **Share Weekly Progress**
- On the **Workouts** page, click the **"Share This Week's Progress with Buddies"** button
- Shares stats with all connected buddies:
  - Number of workouts completed
  - Active days (0-7)
  - Total duration (minutes)
  - Total calories burned
  - Weekly progress percentage

### 2. **Share Individual Workouts**
- On the **Workouts** page, next to each logged workout, there's a **purple Share button** (💜)
- Click to instantly share workout details with all connected buddies:
  - Workout type (Running, Gym, etc.)
  - Duration in minutes
  - Calories burned
  - Distance (if applicable)
  - Custom message

### 3. **View Buddy Progress Feed**
- New **"Buddy Progress"** tab appears in the **Buddies** page when you receive shares
- See a feed of all shared achievements from connected buddies
- Each share shows:
  - Buddy's name and avatar
  - Type of share (Weekly Summary or Workout)
  - Shared stats with cards (Workouts, Duration, Calories, etc.)
  - **"Send Motivation"** button to message your buddy

### 4. **Motivation Messages**
- Click **"Send Motivation"** on any shared progress
- Opens the chat with that buddy so you can congratulate them
- Provide encouragement and support

---

## 🗄️ Database Changes

### New Table: `progress_shares`
Created to track all shared progress between buddies:

```sql
CREATE TABLE progress_shares (
  id UUID PRIMARY KEY,
  sharer_id UUID,              -- User sharing their progress
  receiver_id UUID,             -- Buddy receiving the share
  share_type TEXT,              -- 'weekly_summary' or 'workout'
  workout_id UUID,              -- Reference to workout (if sharing single)
  title TEXT,                   -- Display title
  message TEXT,                 -- Custom message
  stats JSONB,                  -- Flexible stats object
  created_at TIMESTAMP
);
```

### Row-Level Security (RLS)
- Users can only create shares from their own account
- Users can only view shares they received or created
- Prevents unauthorized access

---

## 💡 How It Works

### Step 1: Share Progress
1. Go to **Workouts** page
2. Click **"Share This Week's Progress with Buddies"** or individual workout share button (💜)
3. Automatically shared with all connected buddies

### Step 2: Receive Shares
1. When a buddy shares, you'll see a new **"Buddy Progress"** tab in Buddies page
2. Shows count of received shares (e.g., "Buddy Progress (5)")

### Step 3: View Shared Progress
1. Click the **"Buddy Progress"** tab
2. Browse through all shared achievements from your buddies
3. See detailed stats cards for each share

### Step 4: Send Motivation
1. Click **"Send Motivation"** on any shared progress
2. Opens chat with that buddy
3. Write and send encouraging messages

---

## 📊 What Gets Shared

### Weekly Summary Stats
```
{
  workouts: 4,
  activeDays: 6,
  duration: 420,        // minutes
  calories: 2100,
  progressPercent: 85   // weekly goal progress
}
```

### Individual Workout Stats
```
{
  type: "Running",
  duration: 45,
  calories: 500,
  distance: 7.5         // km (if applicable)
}
```

---

## 🔒 Privacy & Control

- ✅ **Only shared with connected buddies** - Recommended or pending buddies cannot see shares
- ✅ **Opt-in sharing** - Only share when you click the share button
- ✅ **RLS Protected** - Database policies prevent unauthorized access
- ✅ **No auto-sharing** - Workouts are private by default

---

## 🎯 Use Cases

1. **Motivation & Accountability** - Stay motivated by seeing buddies' progress
2. **Celebrate Milestones** - Share weekly goals achieved with supporters
3. **Friendly Competition** - Share impressive workouts to inspire buddies
4. **Support Network** - Send encouragement messages to buddies
5. **Community Building** - Build stronger connections through shared achievements

---

## 🚀 How to Deploy

1. **Run SQL to create the `progress_shares` table:**
   ```sql
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

   -- RLS Policies
   CREATE POLICY "Users can share their own progress"
     ON progress_shares FOR INSERT
     WITH CHECK (sharer_id = auth.uid());

   CREATE POLICY "Users can view shared progress with them"
     ON progress_shares FOR SELECT
     USING (receiver_id = auth.uid() OR sharer_id = auth.uid());
   ```

2. **Features are already implemented in the frontend:**
   - Workouts page has share buttons
   - Buddies page has new "Buddy Progress" tab
   - All functionality ready to use

3. **Test it:**
   - Create a profile with a buddy
   - Log a workout
   - Click share button
   - Check buddy's "Buddy Progress" tab
   - Send motivation message

---

## 📝 Notes

- Shares include timestamps so buddies can see when achievements were made
- Stats are stored as flexible JSONB, allowing future expansion
- Share counts update automatically in the Buddies tabs
- "Send Motivation" button opens existing chat system with buddy

---

## 🎉 Next Steps

- Monitor buddy interactions and engagement
- Consider adding share notifications
- Add "Like" or "React" emoji feature to shares
- Create achievement milestones for sharing streaks
