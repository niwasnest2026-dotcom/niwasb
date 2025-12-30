# Manual Database Setup - Fix 400 Bad Request Errors

## 🚨 **CURRENT ISSUE**: 400 Bad Request from Supabase

The error you're seeing is because your database is missing the `is_available` column that the code expects. Here's how to fix it manually:

## ✅ **STEP-BY-STEP FIX:**

### **1. Add Missing Column to Properties Table**

1. **Go to**: https://supabase.com/dashboard
2. **Login** and select your project: `xpasvhmwuhipzvcqohhq`
3. **Navigate**: Table Editor → `properties` table
4. **Click**: "Add Column" button
5. **Configure the new column**:
   - **Column Name**: `is_available`
   - **Type**: `boolean`
   - **Default Value**: `true`
   - **Allow Nullable**: `false` (uncheck)
6. **Click**: "Save"

### **2. Test the Fix**

After adding the column:

1. **Visit**: `https://www.niwasnest.com/api/check-properties`
2. **Should show**: `"hasIsAvailableColumn": true`
3. **Visit**: `https://www.niwasnest.com/admin/setup`
4. **Click**: "Add Sample Properties"
5. **Should succeed** without 400 errors

### **3. Verify Properties Load**

1. **Homepage**: `https://www.niwasnest.com/` - Should show properties
2. **Listings**: `https://www.niwasnest.com/listings` - Should work without errors
3. **Console**: Should be clean without 400 errors

## 🔧 **ALTERNATIVE: SQL Command**

If you have SQL access in Supabase:

```sql
ALTER TABLE properties ADD COLUMN is_available BOOLEAN DEFAULT true;
UPDATE properties SET is_available = true WHERE is_available IS NULL;
```

## 📊 **WHAT THIS FIXES:**

### **Before Fix:**
- ❌ 400 Bad Request errors
- ❌ Properties not loading
- ❌ Console errors about missing column

### **After Fix:**
- ✅ API requests succeed
- ✅ Properties load on homepage
- ✅ Clean console without errors
- ✅ Admin can add sample properties

## 🎯 **WHY THIS HAPPENED:**

The code was updated to use an `is_available` column to control which properties are visible, but your existing database doesn't have this column yet. This is a common issue when database schema changes aren't automatically applied.

## 🚀 **EXPECTED TIMELINE:**

- **Adding column**: 30 seconds
- **Testing fix**: 1 minute
- **Total time**: Under 2 minutes

---

**🔥 This simple column addition will fix all the 400 errors immediately! 🔥**