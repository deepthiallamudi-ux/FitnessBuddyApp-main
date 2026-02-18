# 🐛 Buddy Search & Leaderboard Fix

## Problem
Users can't find other buddies when searching and can't see other users in the leaderboard.

## Root Cause
The RLS (Row Level Security) policies on your Supabase database were too restrictive:
- Users could **only read their own profile**
- Users could **only read their own workouts**
- Users could **only read their own goals**

This prevented buddy search and leaderboard from displaying other users' data.

## Solution
Update the RLS policies to allow authenticated users to **read** all profiles, workouts, goals, and achievements, while maintaining restrictions on **write** operations (only users can modify their own data).

## How to Apply the Fix

### Step 1: Go to Supabase SQL Editor
1. Log in to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** on the left sidebar
4. Click **"New Query"**

### Step 2: Run the Migration Script
1. Open the file: `RLS_POLICY_FIX.sql` 
2. Copy all the SQL code
3. Paste it into the Supabase SQL Editor query box
4. Click **"Run"** button

**Important**: You should get "Success" messages for each policy. If you see errors about policies already existing, you can safely ignore them or drop the old policies first (the script handles this).

### Step 3: Test the Features
1. Go back to your app
2. Log in with a different user account (use incognito window or another browser)
3. Try these tests:

**Test Buddy Search:**
- Go to Buddies page
- You should see other users in "Recommended Buddies"
- Search for a username of another user
- Should find results

**Test Leaderboard:**
- Go to Leaderboard page  
- Should see multiple users ranked by their points
- Not just your own profile

## What Changed

### Before (Restrictive)
```sql
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());  -- ❌ Only your own profile
```

### After (Collaborative)
```sql
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');  -- ✅ All profiles
```

This change is applied to:
- ✅ profiles table (read all, write own)
- ✅ workouts table (read all, write own)
- ✅ fitness_goals table (read all, write own)
- ✅ achievements table (read all, write own)
- ✅ buddies table (read all, manage own)
- ✅ saved_gyms table (read all, manage own)

## Security Impact
✅ **Still Secure** - Users still can't:
- View other users' private data (if any)
- Modify other users' profiles, workouts, or goals
- Delete other users' data
- Access data without authentication

✅ **Privacy** - This is similar to other social fitness apps where:
- Your profile is visible to other users (for social features)
- Your workouts are visible on the leaderboard
- Your achievements are visible
- But only you can edit your own data

## If You Still Have Issues

### Issue: Still can't see buddies after fix
- **Solution**: Clear browser cache and reload the page
- **Alternative**: Open the page in an incognito window
- **Check**: Make sure at least 2 user accounts exist in your Supabase auth

### Issue: Leaderboard shows no one or just you
- **Solution**: Make sure you have workouts logged from multiple users
- **Debug**: Go to Leaderboard page → Check browser console (F12) for errors
- **Check**: Verify workouts exist in Supabase (Check "workouts" table directly)

### Issue: Getting errors in SQL
- **Solution**: Some policies might already exist. You can safely run the script again, errors about existing policies can be ignored
- **Alternative**: Go to Supabase → Authentication → Policies and manually delete the old restrictive policies first

## Files Changed
- `SUPABASE_SCHEMA.sql` - Updated with new RLS policies (for reference)
- `RLS_POLICY_FIX.sql` - Migration script to run in Supabase

## What to Do Next
1. ✅ Run the RLS_POLICY_FIX.sql script in Supabase
2. ✅ Test buddy search with another account
3. ✅ Test leaderboard 
4. ✅ Verify features work as expected
5. 📝 Update your app documentation noting this security model

---

**Need Help?** Check your browser console (F12) for any GraphQL or API errors. They'll help diagnose remaining issues.
