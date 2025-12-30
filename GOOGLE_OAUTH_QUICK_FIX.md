# Google OAuth Quick Fix - Works for Both Local & Production

## 🚨 **Current Issue**: "This site can't be reached" on localhost

**Problem**: Google OAuth isn't configured for localhost development.

## ✅ **IMMEDIATE FIX (5 minutes)**

### **Step 1: Google Cloud Console Setup**
1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials** > **+ CREATE CREDENTIALS** > **OAuth client ID**
3. **Web application** with these **EXACT URLs**:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://www.niwasnest.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://www.niwasnest.com/auth/callback
https://xpasvhmwuhipzvcqohhq.supabase.co/auth/v1/callback
```

### **Step 2: Supabase Configuration**
1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Authentication** > **Providers** > **Google** > **Enable**
3. **Add your Client ID and Client Secret** from Google Cloud Console
4. **Authentication** > **URL Configuration**:
   - **Site URL**: `https://www.niwasnest.com`
   - **Redirect URLs**: Add both localhost and production URLs

### **Step 3: Test Immediately**
1. **Start your server**: `npm run dev`
2. **Go to**: `http://localhost:3000/signup`
3. **Click**: "Sign up with Google"
4. **Should work**: Redirects to Google, then back to localhost

## 🔧 **What I Fixed in Code**

✅ **Smart URL Detection**: Code now automatically detects if you're on localhost or production
✅ **Dual Environment**: Works for both `localhost:3000` and `www.niwasnest.com`
✅ **No More Errors**: Proper redirect URLs for each environment

## 📱 **How It Works Now**

### **Local Development (localhost:3000)**
- Detects localhost automatically
- Uses `http://localhost:3000/auth/callback`
- Perfect for testing and development

### **Production (www.niwasnest.com)**
- Detects production domain automatically  
- Uses `https://www.niwasnest.com/auth/callback`
- Ready for live users

## 🎯 **Result After Setup**

✅ **Local testing**: `http://localhost:3000/signup` → Google OAuth works
✅ **Production**: `https://www.niwasnest.com/signup` → Google OAuth works
✅ **No more "site can't be reached"** errors
✅ **Same configuration** works for both environments

---

**Just configure Google Cloud Console with BOTH URLs and you're done! 🎉**