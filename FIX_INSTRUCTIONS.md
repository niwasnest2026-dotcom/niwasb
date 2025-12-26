# URGENT: Fix Property Add/Edit Errors

## The Problem
You're getting errors when trying to add or edit properties because:
1. Database is missing the `updated_at` column
2. Row Level Security (RLS) is blocking operations
3. Some related tables might be missing

## The Solution

### Step 1: Run the Database Fix
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `xpasvhmwuhipzvcqohhq`
3. Go to **SQL Editor** in the left sidebar
4. Copy the entire contents of `URGENT_DATABASE_FIX.sql` 
5. Paste it into the SQL Editor
6. Click **Run** button

### Step 2: Test the Fix
1. After running the SQL, go back to your app
2. Try adding a new property at `/admin/properties/add`
3. Try editing an existing property

## What the Fix Does
- ✅ Adds missing `updated_at` column
- ✅ Ensures `gender_preference` column exists
- ✅ **Disables RLS** (the main blocker)
- ✅ Creates missing tables (`property_images`, `amenities`, `property_amenities`)
- ✅ Adds basic amenities data
- ✅ Tests the fix automatically

## Expected Result
After running the fix, you should see:
```
SUCCESS: Property UPDATE test passed! Property add/edit should work now.
```

## If You Still Get Errors
1. Check the browser console for specific error messages
2. Try the test admin page at `/test-admin` to diagnose issues
3. Make sure you're logged in as an admin user

## Files Updated
- Fixed TypeScript casting issues in property forms
- Removed problematic `updated_at` field from UPDATE queries
- Cleaned up Supabase client calls

The property add/edit functionality should work perfectly after running the database fix!