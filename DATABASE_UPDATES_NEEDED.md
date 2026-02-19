# Database Updates Required

## Overview
Two important SQL statements need to be executed in your Supabase SQL Editor to enable the new BMI tracking and leaderboard visibility features.

## 1. Add BMI Tracking Columns to Profiles Table

**Purpose:** Stores user's weight, height, target weight, and target BMI for calculations

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_weight FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_bmi FLOAT;
```

**In Supabase:**
1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the above SQL
4. Click **Run**

## 2. Enable Public Leaderboard Access (Already in Schema)

**Purpose:** Allows the leaderboard to display all users' workout data

```sql
CREATE POLICY "Anyone can view all workouts for leaderboard"
  ON workouts FOR SELECT
  USING (true);
```

**In Supabase:**
1. Go to **SQL Editor** (if you haven't already)
2. Create a new query
3. Copy and paste the above SQL
4. Click **Run**

---

## What These Changes Enable

### BMI Tracking Features
- ✅ Users can add weight and height in their Profile
- ✅ Current BMI is automatically calculated and displayed
- ✅ Target weight and target BMI can be set
- ✅ Workouts page shows:
  - Current BMI with category (Underweight/Normal/Overweight/Obese)
  - Weight loss impact from workouts
  - Target weight progress tracking
  - Estimated days to reach target weight based on workout pace

### Leaderboard Visibility
- ✅ All users' workout data is visible in the Leaderboard
- ✅ Points calculation: (workouts × 10) + (minutes × 1) + (calories × 0.1)

### Buddy System Improvements
- ✅ When you send a connection request, it shows "Request Sent" tab
- ✅ Connected buddies only appear in "My Buddies" section
- ✅ Pending requests can be cancelled or accepted by the other user

---

## After Running the SQL

1. **In Profile Page:**
   - Edit your profile
   - Add your weight (kg), height (cm), target weight, and target BMI
   - Save changes
   - You'll see your current BMI calculated in real-time

2. **In Workouts Page:**
   - A new "BMI & Weight Loss Progress" section will appear
   - Shows current BMI, weight loss from recent workouts
   - Displays estimated days to reach your target
   - Tracks progress toward target weight

3. **In Buddies Page:**
   - Connect requests now show in a separate "Pending" tab
   - Recommended buddies exclude those with pending requests
   - Connected buddies appear only in "My Buddies" section

---

## Execution Order
1. First, run the BMI columns SQL
2. Then, run the leaderboard policy SQL
3. Refresh your app in the browser
4. All features will be active!

---

## Need Help?
- Make sure you're logged into Supabase as an admin
- SQL Editor is under the "SQL Editor" tab in your Supabase dashboard
- If you get permission errors, make sure RLS is enabled on the tables
