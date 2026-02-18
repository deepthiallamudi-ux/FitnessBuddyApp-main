# Troubleshooting Guide - Database & Storage Issues

## Issue 1: Avatar Upload Error - "Row Violates Row-Level Security Policy"

### Root Cause
The Supabase `avatars` storage bucket doesn't have proper Row-Level Security (RLS) policies configured, preventing file uploads.

### Solution

#### Step 1: Apply Database Migrations
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open file: `DATABASE_MIGRATIONS.sql` (in project root)
3. Copy ALL content
4. Paste into Supabase SQL Editor
5. Click **"Run"** button to execute

**OR** run individual migration for just avatars:
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar read policy" ON storage.objects;

-- Create new policies
CREATE POLICY "Avatar upload policy"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Avatar read policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');
```

#### Step 2: Verify Avatars Bucket Exists
1. Go to **Supabase Dashboard** → **Storage**
2. Check if `avatars` bucket exists
3. If not, click **"+ New Bucket"** and create:
   - Name: `avatars`
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

#### Step 3: Test Avatar Upload
1. Refresh browser: `Ctrl+Shift+R`
2. Go to **Profile** page
3. Click **"Upload Photo"**
4. Select image and save

---

## Issue 2: Goal Type Column Error - "Could Not Find 'goal_type' Column"

### Root Cause
The `goal_type` column was added to the code schema but not to the actual Supabase database.

### Solution

#### Step 1: Apply Migration
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL:

```sql
-- Add goal_type column to fitness_goals table
ALTER TABLE fitness_goals ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'weekly';

-- Add index for performance
CREATE INDEX IF NOT EXISTS fitness_goals_user_goal_type_idx 
ON fitness_goals(user_id, goal_type);
```

#### Step 2: Verify Column Was Added
1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on `fitness_goals` table
3. Scroll right to verify `goal_type` column exists
4. Should show default value: `'weekly'`

#### Step 3: Test Goal Creation
1. Refresh browser: `Ctrl+Shift+R`
2. Go to **Goals** page
3. Create new goal
4. Select goal type (Daily/Weekly/Monthly)
5. Should save without errors

---

## Issue 3: Deleted Workouts Still Visible in History

### Root Cause
State wasn't properly updating immediately after deletion, causing old data to still display until page refresh.

### Solution Applied ✅
**File Modified**: `src/pages/Workouts.jsx` (lines 159-181)

The fix includes:
1. **Instant UI Update**: Removes workout from local state immediately
2. **Database Deletion**: Performs the actual delete in Supabase
3. **Error Handling**: Restores state if deletion fails
4. **State Refresh**: Calls fetchWorkouts() after successful deletion
5. **Event Dispatch**: Triggers related data updates (leaderboard, achievements)

**Code Changes**:
```javascript
// Before (didn't update state correctly)
const { error } = await supabase.from("workouts").delete().eq("id", id)

// After (optimistic update + proper refresh)
setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== id)) // Instant removal
// ... perform deletion ...
setTimeout(() => {
  fetchWorkouts() // Refresh from server
}, 500)
```

#### Step 1: Verify Fix Works
1. Refresh browser: `Ctrl+Shift+R`
2. Go to **Workouts** page
3. Log a workout
4. Delete the workout
5. Should disappear instantly

#### Step 2: If Still Not Working
- Hard refresh: `Ctrl+Shift+R`
- Clear browser cache: `Ctrl+Shift+Delete`
- Or check browser console: `F12` → Console tab for errors

---

## Complete Migration Process (Recommended)

### Step-by-Step Guide

#### 1. Access Supabase SQL Editor
```
Supabase Dashboard → Projects → [Your Project] → SQL Editor
```

#### 2. Copy Full Migration File
- File: `DATABASE_MIGRATIONS.sql`
- This includes ALL fixes:
  - ✅ Add goal_type column
  - ✅ Setup avatar RLS policies
  - ✅ Create indexes
  - ✅ Fix all RLS policies

#### 3. Execute Migration
1. Paste content into SQL Editor
2. Click **"Run"** button
3. Wait for completion (should see success message)

#### 4. Verify Success
Check each fix:
```sql
-- Check if goal_type column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'fitness_goals' AND column_name = 'goal_type';

-- Check storage policies
SELECT policy_name, operation FROM pg_policies 
WHERE tablename = 'objects' AND policy_name LIKE 'Avatar%';

-- Check profiles table
SELECT COUNT(*) FROM profiles LIMIT 1;
```

#### 5. Test in Frontend
1. **Profile Picture**: Upload avatar → Should work
2. **Goals**: Create goal with type → Should save
3. **Workouts**: Delete workout → Should disappear instantly

---

## Troubleshooting Checklist

### Avatar Upload Still Not Working?
- [ ] Ran SQL migrations? (Step 1 above)
- [ ] Avatars bucket exists in Storage?
- [ ] Bucket has correct permissions?
- [ ] Cleared browser cache? (`Ctrl+Shift+Delete`)
- [ ] Refreshed page? (`Ctrl+Shift+R`)

**Action**: 
1. Delete avatars bucket
2. Re-run full migration
3. Test again

### Goal Type Error Still Showing?
- [ ] Ran migration to add goal_type column?
- [ ] Verified column exists in database?
- [ ] Created new goal after migration?
- [ ] Cleared localStorage? (`F12 → Application → Local Storage → Clear`)

**Action**:
1. Run goal_type migration again
2. Clear localStorage
3. Refresh page
4. Test creating new goal

### Workouts Still Showing After Delete?
- [ ] Applied fix to Workouts.jsx?
- [ ] Hard refreshed page? (`Ctrl+Shift+R`)
- [ ] Checked browser console for errors? (`F12`)
- [ ] RLS policies correct on workouts table?

**Action**:
1. Hard refresh: `Ctrl+Shift+R`
2. Check console: `F12 → Console`
3. Copy error message if any
4. Try deleting again

---

## Database Schema Verification

Run this SQL to verify everything is set up correctly:

```sql
-- Check all required columns exist
SELECT 
  'fitness_goals' as table_name,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'fitness_goals'
UNION ALL
SELECT 
  'workouts',
  COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'workouts'
UNION ALL
SELECT 
  'profiles',
  COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check specific columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('fitness_goals', 'workouts', 'profiles')
ORDER BY table_name, column_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('fitness_goals', 'workouts', 'profiles');
```

---

## Common Errors & Solutions

### Error: "relation 'buddy_connections' does not exist"
**Solution**: Run the migration to create the table
```sql
CREATE TABLE IF NOT EXISTS buddy_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Error: "column 'goal_type' does not exist"
**Solution**: Run the goal_type migration
```sql
ALTER TABLE fitness_goals ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'weekly';
```

### Error: "new row violates row-level security policy"
**Solution**: Run the RLS policy migrations
```sql
CREATE POLICY "Avatar upload policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

### Error: "Permission denied for storage"
**Solution**: Check bucket permissions and RLS settings

---

## Performance Tips

### After Running Migrations:
1. **Clear Cache**: Hard refresh page (`Ctrl+Shift+R`)
2. **Clear Storage**: Open DevTools → Application → Clear All
3. **Wait 10 seconds**: Let Supabase update schema cache
4. **Retry operation**: Try the action again

### If Still Slow:
1. Check RLS policies aren't too restrictive
2. Verify indexes were created (`GRANT select on table`)
3. Monitor database query performance

---

## File References

- **Migrations**: `DATABASE_MIGRATIONS.sql`
- **Frontend Fix**: `src/pages/Workouts.jsx`
- **Testing Guide**: `BACKEND_TESTING_GUIDE.md`
- **Quick Reference**: `QUICK_REFERENCE.md`

---

## Need Help?

If issues persist:

1. **Copy error message exactly**
2. **Check browser console** (F12 → Console):
   ```
   Specific error text helps identify issue
   ```
3. **Verify migrations ran** in Supabase SQL Editor
4. **Try in incognito mode** to rule out cache
5. **Check backend logs** if testing backend

---

## Summary of All Fixes

| Issue | Fixed By | Location |
|-------|----------|----------|
| Avatar RLS error | SQL Migration | `DATABASE_MIGRATIONS.sql` (lines 7-27) |
| Goal type column missing | SQL Migration | `DATABASE_MIGRATIONS.sql` (lines 3-6) |
| Deleted workouts visible | Code update | `src/pages/Workouts.jsx` (lines 159-181) |
| Schema cache issues | Full migration | `DATABASE_MIGRATIONS.sql` (all sections) |

✅ **All issues should be resolved after applying migrations and reloading!**
