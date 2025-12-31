# Google OAuth Localhost Redirect Fix

## Problem
Google OAuth is still redirecting to localhost instead of production domain (www.niwasnest.com).

## Root Cause Analysis
The issue is likely in one of these places:
1. **Supabase Dashboard Configuration** - Site URL settings
2. **Google Cloud Console** - Authorized redirect URIs
3. **Browser Cache** - Cached OAuth URLs
4. **Supabase Project Settings** - Authentication settings

## ✅ Code Fixes Applied

### 1. Hardcoded Production URLs
- **Login Page**: Forces `https://www.niwasnest.com/auth/callback`
- **Signup Page**: Forces `https://www.niwasnest.com/auth/callback`
- **Auth Callback**: Forces redirect to `https://www.niwasnest.com/`

### 2. Enhanced Debugging
- Added console logs to track OAuth flow
- Logs current window location and redirect URLs
- Tracks OAuth response data

### 3. Forced Redirect in Callback
- Auth callback now explicitly redirects to production domain
- No longer uses dynamic origin detection

## 🔧 Required Supabase Dashboard Configuration

### Go to Supabase Dashboard → Authentication → URL Configuration

**Site URL**: `https://www.niwasnest.com`

**Additional Redirect URLs**: 
```
https://www.niwasnest.com/auth/callback
https://www.niwasnest.com/
```

### Authentication Settings
- **Enable third-party logins**: ✅ Google
- **Site URL**: `https://www.niwasnest.com`
- **Redirect URLs**: Must include `https://www.niwasnest.com/auth/callback`

## 🔧 Required Google Cloud Console Configuration

### Go to Google Cloud Console → APIs & Services → Credentials

**Authorized JavaScript origins**:
```
https://www.niwasnest.com
```

**Authorized redirect URIs**:
```
https://xpasvhmwuhipzvcqohhq.supabase.co/auth/v1/callback
https://www.niwasnest.com/auth/callback
```

## 🧪 Testing Steps

### 1. Clear Browser Cache
```bash
# Clear all browser data for your domain
# Or use incognito/private browsing mode
```

### 2. Test OAuth Flow
1. Go to `https://www.niwasnest.com/login`
2. Click "Login with Google"
3. Check browser console for logs:
   - Should show: `🔐 Google OAuth redirect URL (FORCED): https://www.niwasnest.com/auth/callback`
   - Should show current window location
4. Complete Google authentication
5. Should redirect back to `https://www.niwasnest.com/`

### 3. Debug Console Logs
Look for these logs in browser console:
```
🔐 Google OAuth redirect URL (FORCED): https://www.niwasnest.com/auth/callback
🌐 Current window location: https://www.niwasnest.com/login
🔐 OAuth response data: {...}
🔐 Auth callback received: {...}
🔐 Exchanging code for session...
✅ Auth callback successful
🔐 Redirecting to: https://www.niwasnest.com/
```

## 🚨 If Still Not Working

### Check Supabase Project Settings
1. Go to Supabase Dashboard
2. Project Settings → Authentication
3. Verify **Site URL** is `https://www.niwasnest.com`
4. Verify **Additional Redirect URLs** includes your callback

### Check Google OAuth Consent Screen
1. Go to Google Cloud Console
2. APIs & Services → OAuth consent screen
3. Verify **Authorized domains** includes `niwasnest.com`

### Force Clear All Caches
1. Clear browser cache completely
2. Try in incognito mode
3. Try different browser
4. Check if localhost is hardcoded anywhere in Supabase settings

## 📝 Environment Variables
Current `.env` configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xpasvhmwuhipzvcqohhq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Expected Behavior After Fix
1. User clicks "Login with Google" on production site
2. Redirects to Google OAuth with correct callback URL
3. After Google authentication, returns to `https://www.niwasnest.com/`
4. User is logged in successfully
5. No localhost URLs anywhere in the flow

## 🔍 Debugging Commands
If issue persists, check these in browser console:
```javascript
// Check current Supabase configuration
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Current origin:', window.location.origin);

// Check if any localStorage has localhost URLs
Object.keys(localStorage).forEach(key => {
  if (localStorage[key].includes('localhost')) {
    console.log('Found localhost in:', key, localStorage[key]);
  }
});
```